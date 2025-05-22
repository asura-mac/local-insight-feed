
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";
import { load } from "https://esm.sh/cheerio@1.0.0-rc.12";
import { EMERGENCY_KEYWORDS, EXCLUSION_KEYWORDS } from "./constants.ts";

// Type definition for emergency alert
interface EmergencyAlert {
  title: string;
  url: string;
  matched_keywords: string[];
}

// Get Supabase client using environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Create Supabase client with admin privileges (service role key)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Function to check if a headline contains any emergency keywords
function containsEmergencyKeyword(headline: string): { contains: boolean; keywords: string[] } {
  const lowercaseHeadline = headline.toLowerCase();
  const matches = EMERGENCY_KEYWORDS.filter(keyword => 
    lowercaseHeadline.includes(keyword.toLowerCase())
  );
  
  // Check for exclusion keywords
  const hasExclusionKeyword = EXCLUSION_KEYWORDS.some(keyword => 
    lowercaseHeadline.includes(keyword.toLowerCase())
  );
  
  return {
    contains: matches.length > 0 && !hasExclusionKeyword,
    keywords: matches
  };
}

// CORS headers for API responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Endpoint handler
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }
  
  try {
    console.log("Starting MoneyControl scraper...");
    
    // Browser-like headers to avoid being blocked
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'max-age=0',
    };
    
    // Fetch the MoneyControl India news page
    const response = await fetch("https://www.moneycontrol.com/news/india/", {
      headers,
      redirect: "follow",
    });
    
    if (!response.ok) {
      throw new Error(`MoneyControl response error: ${response.status} ${response.statusText}`);
    }
    
    const html = await response.text();
    
    // Parse the HTML using cheerio
    const $ = load(html);
    
    // Extract headlines and URLs from h2 tags in the news section
    const emergencyAlerts: EmergencyAlert[] = [];
    
    // Target the main news container that holds h2 headlines
    $('h2').each((_, element) => {
      try {
        let title = $(element).text().trim();
        
        // Skip empty titles
        if (!title) return;
        
        // Find the anchor tag - could be parent or child of h2
        let anchor: cheerio.Cheerio;
        if ($(element).parent('a').length > 0) {
          anchor = $(element).parent('a');
        } else if ($(element).find('a').length > 0) {
          anchor = $(element).find('a');
        } else {
          // No anchor tag found
          return;
        }
        
        let url = anchor.attr('href') || '';
        
        // Handle relative URLs
        if (url && url.startsWith('/')) {
          url = `https://www.moneycontrol.com${url}`;
        }
        
        // Skip empty URLs
        if (!url) return;
        
        // Check if the headline contains emergency keywords
        const { contains, keywords } = containsEmergencyKeyword(title);
        
        if (contains && keywords.length > 0) {
          emergencyAlerts.push({
            title,
            url,
            matched_keywords: keywords
          });
          
          console.log(`Emergency headline found: "${title}" with keywords: ${keywords.join(', ')}`);
        }
      } catch (error) {
        console.error("Error processing a headline:", error);
      }
    });
    
    console.log(`Found ${emergencyAlerts.length} emergency headlines from MoneyControl`);
    
    // Store emergency alerts in the database (if any)
    if (emergencyAlerts.length > 0) {
      const { data, error } = await supabase
        .from('emergency_alerts')
        .upsert(
          emergencyAlerts.map(alert => ({
            title: alert.title,
            url: alert.url,
            matched_keywords: alert.matched_keywords,
            source: "MoneyControl"
          })),
          { 
            onConflict: 'url',
            ignoreDuplicates: true
          }
        );
      
      if (error) {
        console.error("Error storing alerts:", error);
        throw error;
      }
      
      console.log(`Successfully stored ${emergencyAlerts.length} emergency alerts from MoneyControl`);
    }
    
    // Return success response
    return new Response(JSON.stringify({
      status: "success",
      message: `Scraped MoneyControl. Found ${emergencyAlerts.length} emergency headlines.`,
      headlines: emergencyAlerts
    }), {
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
    
  } catch (error) {
    console.error("MoneyControl scraper error:", error);
    
    // Return error response
    return new Response(JSON.stringify({
      status: "error",
      message: `Failed to scrape MoneyControl: ${error.message}`
    }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  }
});
