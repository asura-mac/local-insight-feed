
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";
import { EMERGENCY_KEYWORDS, EXCLUSION_KEYWORDS } from "./constants.ts";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.43/deno-dom-wasm.ts";

// Get Supabase client using environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Create Supabase client with admin privileges (service role key)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Define emergency alert interface to match updated schema
interface EmergencyAlert {
  headline: string;
  url: string;
  matched_keywords: string[];
  source: string;
  published_at?: string;
  alert_type?: string;
  severity?: string;
}

// CORS headers for API responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

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

// Function to store detected alerts in Supabase
async function storeAlerts(alerts: EmergencyAlert[]) {
  if (alerts.length === 0) {
    return;
  }
  
  try {
    console.log(`Attempting to store ${alerts.length} alerts from MoneyControl`);
    
    for (const alert of alerts) {
      console.log(`Processing alert: ${alert.headline}`);
      
      const { data, error } = await supabase
        .from('emergency_alerts')
        .upsert(alert, {
          onConflict: 'headline',
          ignoreDuplicates: false
        });
      
      if (error) {
        console.error(`Error storing alert "${alert.headline}":`, error);
      } else {
        console.log(`Successfully stored/updated alert: ${alert.headline}`);
      }
    }
  } catch (error) {
    console.error("Exception during alert storage:", error);
    throw error;
  }
}

// Add random delay to avoid detection
async function addRandomDelay(minMs = 500, maxMs = 2000): Promise<number> {
  const delay = Math.floor(Math.random() * (maxMs - minMs)) + minMs;
  await new Promise(resolve => setTimeout(resolve, delay));
  return delay;
}

// Function to scrape MoneyControl news
async function scrapeMoneyControl(): Promise<EmergencyAlert[]> {
  const url = "https://www.moneycontrol.com/news/india/";
  const emergencyAlerts: EmergencyAlert[] = [];
  
  try {
    // Add random delay to simulate human behavior
    const delay = await addRandomDelay();
    console.log(`Adding random delay of ${delay}ms`);
    
    // Set up browser-like headers to avoid detection
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Referer': 'https://www.moneycontrol.com/',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'max-age=0',
    };
    
    console.log(`Fetching MoneyControl news from ${url}`);
    
    // Fetch the MoneyControl India news page
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const html = await response.text();
    const parser = new DOMParser();
    const document = parser.parseFromString(html, "text/html");
    
    if (!document) {
      throw new Error("Failed to parse HTML");
    }
    
    console.log("Successfully fetched and parsed MoneyControl news page");
    
    // Find news headlines - MoneyControl uses h2 tags for main headlines
    const headlineElements = document.querySelectorAll('h2');
    
    console.log(`Found ${headlineElements.length} potential headline elements`);
    
    // Process each headline
    for (const element of headlineElements) {
      // Find the headline text
      const headlineText = element.textContent?.trim();
      
      if (!headlineText || headlineText.length < 10) {
        continue; // Skip short or empty headlines
      }
      
      // Find the link to the full article
      let articleUrl = "";
      const anchorEl = element.querySelector('a') || element.closest('a');
      
      if (anchorEl) {
        articleUrl = anchorEl.getAttribute('href') || "";
        
        // Ensure URL is absolute (add base URL if it's relative)
        if (articleUrl && !articleUrl.startsWith('http')) {
          articleUrl = articleUrl.startsWith('/') 
            ? `https://www.moneycontrol.com${articleUrl}`
            : `https://www.moneycontrol.com/${articleUrl}`;
        }
      }
      
      // Skip if no valid URL found
      if (!articleUrl) {
        continue;
      }
      
      // Check if headline contains emergency keywords
      const matchedKeywords = containsEmergencyKeyword(headlineText);
      
      if (matchedKeywords.length > 0) {
        console.log(`Emergency headline found: "${headlineText}" with keywords: ${matchedKeywords.join(', ')}`);
        
        // Create alert object with the updated schema
        emergencyAlerts.push({
          headline: headlineText,
          url: articleUrl,
          matched_keywords: matchedKeywords,
          source: "moneycontrol",
          alert_type: "news",
          severity: matchedKeywords.length > 2 ? "high" : "medium",
          published_at: new Date().toISOString(),
        });
      }
    }
    
    console.log(`Found ${emergencyAlerts.length} emergency headlines from MoneyControl`);
    return emergencyAlerts;
    
  } catch (error) {
    console.error("MoneyControl scraper error:", error);
    throw error;
  }
}

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
    console.log("Starting MoneyControl scraper...");
    
    // Scrape for emergency headlines
    const alerts = await scrapeMoneyControl();
    
    // Store alerts in Supabase
    await storeAlerts(alerts);
    
    // Return success response
    return new Response(
      JSON.stringify({
        status: "success",
        message: `Found ${alerts.length} emergency headlines from MoneyControl`,
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
    console.error("MoneyControl scraper error:", error);
    
    // Return error response
    return new Response(
      JSON.stringify({ 
        status: "error",
        message: `MoneyControl scraper failed: ${error.message}`
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
