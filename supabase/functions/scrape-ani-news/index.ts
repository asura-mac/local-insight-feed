
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

// Function to scrape ANI News
async function scrapeANINews(url: string) {
  console.log(`Scraping URL: ${url}`);
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Lovable/1.0)",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const html = await response.text();
    
    // Extract headlines from div.category_news_title
    const headlines: { title: string; url: string; }[] = [];
    const titleDivRegex = /<div class="category_news_title">.*?<a href="([^"]+)".*?>(.*?)<\/a>/gs;
    
    let match;
    while ((match = titleDivRegex.exec(html)) !== null) {
      const url = match[1];
      const title = match[2].trim().replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
      
      headlines.push({ title, url });
    }
    
    return headlines;
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return [];
  }
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
    const { data, error, count } = await supabase
      .from('emergency_alerts')
      .upsert(
        alerts.map(alert => ({
          title: alert.title,
          url: alert.url,
          matched_keywords: alert.matched_keywords
        })),
        { onConflict: 'title,url', ignoreDuplicates: true }
      )
      .select('id');
    
    if (error) {
      throw error;
    }
    
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
    
    // URLs to scrape
    const urlsToScrape = [
      "https://www.aninews.in/news/national/",
      "https://www.aninews.in/news/international/",
      "https://www.aninews.in/news/world/"
    ];
    
    // Scrape all URLs
    const scrapingPromises = urlsToScrape.map(url => scrapeANINews(url));
    const headlinesArrays = await Promise.all(scrapingPromises);
    
    // Flatten the arrays of headlines
    const allHeadlines = headlinesArrays.flat();
    console.log(`Total headlines scraped: ${allHeadlines.length}`);
    
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
