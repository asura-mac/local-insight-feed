
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Initialize Supabase client with environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Expanded emergency keywords to filter headlines
const EMERGENCY_KEYWORDS = [
  // General emergency alerts
  'emergency alert today', 'breaking emergency news', 'red alert issued',
  'emergency evacuation', 'national emergency alert', 'public safety alert',
  'government emergency update', 'real-time emergency alert', 'disaster alert india',
  'high alert issued', 'city lockdown news', 'state emergency news',
  'emergency notification system', 'emergency broadcast today', 'ani emergency bulletin',
  
  // War and conflict related
  'war breaking news', 'india border tensions', 'conflict zone alert',
  'military operation alert', 'defense news india', 'ceasefire violation news',
  'army movement alert', 'cross-border shelling', 'ani war report',
  'warzone update', 'military strike alert', 'strategic airstrike news',
  'indo-china border alert', 'indo-pak conflict', 'missile attack alert',
  'troop deployment alert',
  
  // Natural disasters
  'earthquake alert india', 'flood warning issued', 'tsunami warning india',
  'cyclone update today', 'landslide alert', 'storm alert india',
  'heavy rainfall red alert', 'severe weather warning', 'ani natural disaster report',
  'real-time weather emergency', 'forest fire breaking news', 'disaster relief alert',
  'ndma alert', 'imd red alert',
  
  // Original keywords
  'emergency', 'war', 'alert', 'blackout',
  'cyclone', 'windstorm', 'thunderstorm', 'thunderstorms',
  'emergency alert today'
];

// CORS headers for all responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
  "Access-Control-Max-Age": "86400",
};

// Function to scrape ANI News with enhanced anti-blocking measures
async function scrapeANINews(url: string) {
  console.log(`Scraping URL: ${url}`);
  try {
    // Updated URLs - ANI News has changed their URL structure
    // Use a more browser-like user agent and additional headers
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://www.google.com/",
        "Cache-Control": "no-cache"
      },
      // Adding a slight delay to avoid rate limiting
      signal: AbortSignal.timeout(30000), // 30-second timeout
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const html = await response.text();
    
    console.log(`Successfully fetched HTML from ${url} (${html.length} bytes)`);
    
    // Extract headlines using updated selectors for various heading formats
    const headlines: { title: string; url: string; }[] = [];
    
    // Pattern 1: h3 tags (previous implementation)
    const h3Regex = /<h3 class="[^"]*"><a href="([^"]+)"[^>]*>([^<]+)<\/a><\/h3>/gs;
    let match;
    while ((match = h3Regex.exec(html)) !== null) {
      const url = match[1].startsWith('https://') ? match[1] : `https://www.aninews.in${match[1]}`;
      const title = cleanHtmlEntities(match[2].trim());
      headlines.push({ title, url });
    }
    
    // Pattern 2: h4 with class="title mt-3" (newly discovered)
    const h4Regex = /<h4 class="title mt-3">(.*?)<\/h4>/gs;
    while ((match = h4Regex.exec(html)) !== null) {
      const title = cleanHtmlEntities(match[1].trim());
      // For h4 tags without direct links, we'll use the current page URL as a fallback
      // A better approach would be to find the parent <a> if possible
      headlines.push({ title, url });
    }
    
    // Pattern 3: h1 tags often used for main headlines
    const h1Regex = /<h1[^>]*>(.*?)<\/h1>/gs;
    while ((match = h1Regex.exec(html)) !== null) {
      const title = cleanHtmlEntities(match[1].trim());
      // Similar to h4, we use current URL as fallback
      headlines.push({ title, url });
    }
    
    // Pattern 4: Generic anchor tags with title attributes or containing text
    const anchorRegex = /<a [^>]*href="([^"]+)"[^>]*>((?!<img|<svg).*?)<\/a>/gs;
    while ((match = anchorRegex.exec(html)) !== null) {
      let title = match[2].trim();
      // Only include if it doesn't contain HTML tags (like images)
      if (!/<[a-z][\s\S]*>/i.test(title) && title.length > 15) {
        title = cleanHtmlEntities(title);
        const url = match[1].startsWith('https://') ? match[1] : `https://www.aninews.in${match[1]}`;
        headlines.push({ title, url });
      }
    }
    
    // Pattern 5: Alternate div pattern (from previous version)
    const altTitleRegex = /<div class="[^"]*title[^"]*">.*?<a href="([^"]+)".*?>(.*?)<\/a>/gs;
    while ((match = altTitleRegex.exec(html)) !== null) {
      const url = match[1].startsWith('https://') ? match[1] : `https://www.aninews.in${match[1]}`;
      const title = cleanHtmlEntities(match[2].trim());
      headlines.push({ title, url });
    }
    
    // Remove duplicates based on title
    const uniqueHeadlines = Array.from(
      new Map(headlines.map(item => [item.title, item])).values()
    );
    
    console.log(`Extracted ${uniqueHeadlines.length} headlines from ${url}`);
    return uniqueHeadlines;
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return [];
  }
}

// Helper function to clean HTML entities
function cleanHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]*>/g, ''); // Strip any remaining HTML tags
}

// Function to check if a headline contains any emergency keywords
function containsEmergencyKeywords(title: string): string[] {
  const lowerTitle = title.toLowerCase();
  return EMERGENCY_KEYWORDS.filter(keyword => 
    lowerTitle.includes(keyword.toLowerCase())
  );
}

// Function to store alerts in Supabase
async function storeAlerts(alerts: any[]) {
  if (alerts.length === 0) {
    return { count: 0 };
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log(`Attempting to upsert ${alerts.length} alerts with service role key`);
    
    // First check if the table exists and is accessible
    const { data: tableCheck, error: tableError } = await supabase
      .from('emergency_alerts')
      .select('id')
      .limit(1);
    
    if (tableError) {
      console.error("Error accessing emergency_alerts table:", tableError);
      throw tableError;
    }
    
    console.log("Successfully connected to emergency_alerts table");
    
    // Prepare alert data for upsert
    const alertsToUpsert = alerts.map(alert => ({
      title: alert.title,
      url: alert.url,
      matched_keywords: alert.matched_keywords
    }));
    
    console.log("Upserting alerts:", JSON.stringify(alertsToUpsert, null, 2));
    
    // Modified to use just 'title' as the conflict target instead of 'title,url'
    const { data, error, count } = await supabase
      .from('emergency_alerts')
      .upsert(alertsToUpsert, { onConflict: 'title', ignoreDuplicates: true })
      .select('id');
    
    if (error) {
      console.error("Error storing alerts:", error);
      throw error;
    }
    
    console.log(`Successfully upserted alerts, returned ${data?.length || 0} new records`);
    return { count: data?.length || 0 };
  } catch (error) {
    console.error("Error storing alerts:", error);
    throw error;
  }
}

serve(async (req) => {
  // Handle preflight OPTIONS request properly
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  
  try {
    console.log("Starting ANI News scraping job");
    
    // Updated URLs to scrape - using current ANI News URL structure
    const urlsToScrape = [
      "https://www.aninews.in/category/national/",
      "https://www.aninews.in/category/international/",
      "https://www.aninews.in/category/world/",
      "https://www.aninews.in/category/india/",
      // Adding some more possible news category URLs
      "https://www.aninews.in/news/national/",
      "https://www.aninews.in/news/",
      "https://www.aninews.in/"
    ];
    
    // Scrape all URLs with a slight delay between each request
    const headlinesArrays = [];
    for (const url of urlsToScrape) {
      const headlines = await scrapeANINews(url);
      headlinesArrays.push(headlines);
      
      // Add a small delay between requests to avoid being blocked
      if (url !== urlsToScrape[urlsToScrape.length - 1]) {
        await new Promise(resolve => setTimeout(resolve, 3000)); // Increased delay to 3 seconds
      }
    }
    
    // Flatten the arrays of headlines
    const allHeadlines = headlinesArrays.flat();
    console.log(`Total headlines scraped: ${allHeadlines.length}`);
    
    // Log all headlines for debugging
    if (allHeadlines.length > 0) {
      console.log("Sample headlines:", allHeadlines.slice(0, 5));
    } else {
      console.log("WARNING: No headlines were found across any URLs!");
    }
    
    // Filter headlines by emergency keywords
    const emergencyAlerts = allHeadlines
      .map(headline => {
        const matchedKeywords = containsEmergencyKeywords(headline.title);
        return matchedKeywords.length > 0 
          ? { ...headline, matched_keywords: matchedKeywords }
          : null;
      })
      .filter((alert): alert is { title: string; url: string; matched_keywords: string[] } => 
        alert !== null
      );
    
    console.log(`Emergency alerts found: ${emergencyAlerts.length}`);
    console.log("🚨 Matched emergency alerts:", emergencyAlerts);
    
    // Store filtered alerts in Supabase
    const result = await storeAlerts(emergencyAlerts);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Scraping completed. Found ${emergencyAlerts.length} emergency alerts, stored ${result.count} new alerts.`,
        alerts: emergencyAlerts,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in ANI News scraping job:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "An unknown error occurred",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
