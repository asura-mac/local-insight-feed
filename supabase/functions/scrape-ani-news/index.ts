import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";
import { EMERGENCY_KEYWORDS, EXCLUSION_KEYWORDS } from "./constants.ts";

// Get Supabase client using environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Create Supabase client with admin privileges (service role key)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Define emergency alert interface
interface EmergencyAlert {
  title: string;
  url: string;
  matched_keywords: string[];
  created_at?: string;
}

// Helper function to check if headline contains any emergency keyword
function containsEmergencyKeyword(headline: string): string[] {
  headline = headline.toLowerCase();
  
  // First, check if headline contains any exclusion keywords
  for (const keyword of EXCLUSION_KEYWORDS) {
    if (headline.includes(keyword.toLowerCase())) {
      return [];
    }
  }
  
  // If no exclusion keywords found, check for emergency keywords
  const matchedKeywords = [];
  for (const keyword of EMERGENCY_KEYWORDS) {
    if (headline.includes(keyword.toLowerCase())) {
      matchedKeywords.push(keyword);
    }
  }
  
  return matchedKeywords;
}

// Function to scrape ANI News
async function scrapeAniNews(): Promise<EmergencyAlert[]> {
  const url = "https://www.aninews.in/";
  const emergencyAlerts: EmergencyAlert[] = [];
  
  try {
    console.log(`Fetching ANI news from ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Use regex to find headlines and URLs
    const regex = /<a href="(.*?)" class="title">(.*?)<\/a>/g;
    let match;
    
    while ((match = regex.exec(html)) !== null) {
      const articleUrl = match[1];
      const headline = match[2].replace(/<\/?[^>]+(>|$)/g, "").trim(); // Remove HTML tags from headline
      
      if (!headline || !articleUrl) {
        continue;
      }
      
      const matchedKeywords = containsEmergencyKeyword(headline);
      
      if (matchedKeywords.length > 0) {
        emergencyAlerts.push({
          title: headline,
          url: articleUrl,
          matched_keywords: matchedKeywords,
          created_at: new Date().toISOString()
        });
      }
    }
    
    console.log(`Found ${emergencyAlerts.length} emergency headlines from ANI`);
    return emergencyAlerts;
    
  } catch (error) {
    console.error("ANI scraper error:", error);
    throw error;
  }
}

// Function to store detected alerts in Supabase
async function storeAlerts(alerts: EmergencyAlert[]) {
  if (alerts.length === 0) {
    return;
  }
  
  try {
    console.log(`Attempting to store ${alerts.length} alerts from ANI`);
    
    for (const alert of alerts) {
      console.log(`Processing alert: ${alert.title}`);
      
      // Transform to match the new schema
      const alertData = {
        headline: alert.title,
        url: alert.url,
        matched_keywords: alert.matched_keywords,
        source: 'ANI News',
        alert_type: 'news',
        severity: alert.matched_keywords.length > 2 ? 'high' : 'medium',
        published_at: alert.created_at || new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('emergency_alerts')
        .upsert(
          alertData,
          { 
            onConflict: 'headline',
            ignoreDuplicates: false
          }
        );
      
      if (error) {
        console.error(`Error storing alert "${alert.title}":`, error);
      } else {
        console.log(`Successfully stored/updated alert: ${alert.title}`);
      }
    }
  } catch (error) {
    console.error("Exception during alert storage:", error);
  }
}

// CORS headers for API responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

// Main handler for the edge function
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }
  
  try {
    console.log("Starting ANI scraper...");
    
    // Scrape for emergency headlines
    const alerts = await scrapeAniNews();
    
    // Store alerts in Supabase
    await storeAlerts(alerts);
    
    // Return success response
    return new Response(
      JSON.stringify({
        status: "success",
        message: `Found ${alerts.length} emergency headlines from ANI`,
        headlines: alerts,
      }),
      {
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
    
  } catch (error) {
    console.error("ANI scraper error:", error);
    
    // Return error response
    return new Response(
      JSON.stringify({ 
        status: "error",
        message: `ANI scraper failed: ${error.message}`
      }),
      { 
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
  }
});
