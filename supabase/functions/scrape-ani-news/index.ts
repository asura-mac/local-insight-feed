
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Initialize Supabase client with environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Updated emergency keywords list focused on India-Pakistan conflict scenarios
const EMERGENCY_KEYWORDS = [
  // Core India-Pakistan War Keywords
  'India Pakistan war', 'India Pakistan conflict', 'India Pakistan border tension',
  'India Pakistan ceasefire violation', 'Indo-Pak war', 'India retaliates Pakistan',
  'Pakistan violates LoC', 'LoC tension India Pakistan', 'cross-border firing',
  'Pakistan drone India border', 'India intercepts Pakistan UAV', 'terror camp destroyed Pakistan',
  'India airstrike Pakistan', 'BSF fires at Pakistan intruders', 'Indian soldier martyred LoC',
  'Pakistani shelling Indian post', 'Pak Army attack India', 'war clouds India Pakistan',
  'Pakistani troops infiltrate', 'India raises war alert', 'Indian Air Force alert',
  'LoC hot zone', 'LoC surveillance alert', 'Pak army mobilizes', 'Indian navy border alert',
  'nuclear threat India Pakistan', 'Pakistan threatens India', 'India defends LoC',
  'militant infiltration LoC', 'India army movement towards border',
  'LoC escalation India Pakistan', 'LoC sniper firing',
  
  // North India
  'Jammu Kashmir war alert', 'Jammu LoC firing', 'Kashmir border escalation',
  'Punjab border tension', 'Punjab drone infiltration', 'Punjab BSF alert',
  'Himachal Pradesh war alert', 'Uttarakhand border alert', 'Delhi on high alert',
  'Delhi war readiness', 'Haryana military alert', 'Haryana troop movement',
  
  // West India
  'Rajasthan war alert', 'Rajasthan LoC activity', 'Rajasthan drone alert',
  'Gujarat border tension', 'Gujarat coastal alert', 'Gujarat navy drill',
  'Maharashtra terror alert', 'Maharashtra war drill', 'Goa war zone alert',
  
  // East India
  'Bihar war alert', 'Bihar Pakistan threat', 'West Bengal infiltration alert',
  'West Bengal border tension', 'Jharkhand war intelligence', 'Jharkhand militant alert',
  'Odisha border intelligence', 'Odisha coastal surveillance', 'Chhattisgarh anti-terror alert',
  
  // Central India
  'Madhya Pradesh war update', 'MP India-Pakistan alert', 'UP war news',
  'Uttar Pradesh war alert', 'UP border activity',
  
  // South India
  'Andhra Pradesh alert India Pakistan', 'Andhra Air Force readiness', 'Telangana terror alert',
  'Telangana war message', 'Karnataka military alert', 'Karnataka India Pakistan conflict',
  'Tamil Nadu navy alert', 'Tamil Nadu Indo-Pak alert', 'Kerala Pakistan support alert',
  'Kerala coastal surveillance',
  
  // North-East India
  'Assam war alert', 'Assam terror movement', 'Manipur LoC influence',
  'Meghalaya Indo-Pak tension', 'Mizoram war alert', 'Nagaland cross-border alert',
  'Tripura terror watch', 'Sikkim war zone news', 'Arunachal Pradesh Pakistan mention',
  
  // Union Territories
  'Ladakh LoC alert', 'Ladakh troop movement', 'Andaman Nicobar navy alert',
  'Lakshadweep war readiness', 'Chandigarh security alert', 'Puducherry Air Force drill',
  'Dadra Nagar Haveli India Pakistan alert', 'Daman Diu security alert', 'Delhi UT missile alert',
  
  // Foreign Geopolitical (Only India-Pakistan Related)
  'China supports Pakistan against India', 'China warns India on war', 'US supports India against Pakistan',
  'Russia on India Pakistan tension', 'UK reacts India Pakistan war', 'UN appeals India Pakistan peace',
  'OIC condemns Indian strike', 'Israel supports Indian action', 'Turkey defends Pakistan',
  'France urges Indo-Pak calm', 'Bangladesh on Indo-Pak war', 'Nepal reacts India Pakistan war',
  'Sri Lanka Indo-Pak reaction', 'Saudi Arabia India Pakistan war update', 'Taliban statement on India Pakistan',
  'UAE comments India Pakistan', 'Afghanistan reacts India Pakistan'
];

// Exclusion filter for headlines when they don't contain India-Pakistan related terms
const EXCLUSION_KEYWORDS = [
  'Ukraine', 'Russia', 'Gaza', 'Israel Hamas', 'Palestine', 'Iran', 'Syria',
  'Hezbollah', 'Yemen', 'North Korea', 'South Korea', 'Taiwan', 'China Taiwan',
  'Lebanon', 'ISIS', 'Middle East', 'Red Sea', 'Houthis', 'NATO', 'Sudan',
  'Libya', 'Somalia', 'Ethiopia', 'DR Congo', 'Kosovo', 'Nagorno-Karabakh',
  'Venezuela', 'Global war update', 'World War III', 'International conflict',
  'US missile strike', 'Hezbollah rocket', 'Israel retaliation', 'Iran nuclear',
  'China South Sea', 'Houthi rebels'
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

// Function to check if a headline contains any emergency keywords and exclude if it only contains exclusion keywords
function containsEmergencyKeywords(title: string): string[] {
  const lowerTitle = title.toLowerCase();
  
  // Check if the headline contains any excluded terms
  const containsExcluded = EXCLUSION_KEYWORDS.some(keyword => 
    lowerTitle.includes(keyword.toLowerCase())
  );
  
  // Check if the headline contains any India-Pakistan keywords
  const matchedKeywords = EMERGENCY_KEYWORDS.filter(keyword => 
    lowerTitle.includes(keyword.toLowerCase())
  );
  
  // If the headline contains exclusion keywords but no India-Pakistan keywords, ignore it
  if (containsExcluded && matchedKeywords.length === 0) {
    return [];
  }
  
  return matchedKeywords;
}

// Function to clean up old alerts (older than 6 hours)
async function cleanupOldAlerts(supabase: any) {
  try {
    // Calculate timestamp for 6 hours ago
    const sixHoursAgo = new Date();
    sixHoursAgo.setHours(sixHoursAgo.getHours() - 6);
    const cutoffTime = sixHoursAgo.toISOString();
    
    console.log(`Cleaning up alerts older than ${cutoffTime}`);
    
    // Delete records older than 6 hours
    const { data, error, count } = await supabase
      .from('emergency_alerts')
      .delete()
      .lt('created_at', cutoffTime)
      .select('id');
    
    if (error) {
      console.error("Error cleaning up old alerts:", error);
      throw error;
    }
    
    console.log(`Successfully removed ${count || 0} old alerts`);
    return { count: count || 0 };
  } catch (error) {
    console.error("Error cleaning up old alerts:", error);
    return { count: 0 };
  }
}

// Function to store alerts in Supabase
async function storeAlerts(alerts: any[]) {
  if (alerts.length === 0) {
    console.log("No alerts to store, skipping database operation");
    return { count: 0 };
  }
  
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    console.log(`Attempting to upsert ${alerts.length} alerts with service role key`);
    console.log("Service Role Key available:", !!supabaseServiceKey);
    console.log("Supabase URL:", supabaseUrl);
    
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
    const { data, error } = await supabase
      .from('emergency_alerts')
      .upsert(alertsToUpsert, { 
        onConflict: 'title',
        ignoreDuplicates: true 
      })
      .select('id');
    
    if (error) {
      console.error("Error storing alerts:", error);
      throw error;
    }
    
    console.log(`Successfully upserted alerts, returned ${data?.length || 0} new records`);
    
    // Clean up old alerts (older than 6 hours)
    await cleanupOldAlerts(supabase);
    
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
    let result;
    try {
      result = await storeAlerts(emergencyAlerts);
      console.log("Storage result:", result);
    } catch (storageError) {
      console.error("Failed to store alerts:", storageError);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Failed to store alerts: ${storageError.message}`,
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
    
    return new Response(
      JSON.stringify({
        success: true,
        message: `Scraping completed. Found ${emergencyAlerts.length} emergency alerts, stored ${result?.count || 0} new alerts. Old alerts cleaned up.`,
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
