
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";
import { load } from "https://esm.sh/cheerio@1.0.0-rc.12";
import { EMERGENCY_KEYWORDS, EXCLUSION_KEYWORDS } from "./constants.ts";

// Type definition for emergency alert
interface EmergencyAlert {
  title: string;
  url: string;
  matched_keywords: string[];
}

// Circuit breaker state
let consecutiveFailures = 0;
const MAX_FAILURES = 5;
const CIRCUIT_BREAKER_TIMEOUT = 30 * 60 * 1000; // 30 minutes
let circuitBreakerTripped = false;
let lastFailureTime = 0;

// URLs to try in order of preference
const ANI_URLS = [
  "https://aninews.in/news/national/",
  "https://aninews.in/news/",
  "https://aninews.in/"
];

// Get Supabase client using environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Create Supabase client with admin privileges (service role key)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Browser-like request headers
const getBrowserHeaders = () => {
  const userAgents = [
    "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Safari/605.1.15",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  ];
  
  const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
  
  return {
    "User-Agent": randomUserAgent,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Cache-Control": "max-age=0",
    "Connection": "keep-alive",
    "Referer": "https://aninews.in/",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1"
  };
};

// Function to add random delay to simulate human behavior
const addRandomDelay = async () => {
  const delay = 1000 + Math.random() * 2000; // 1-3 seconds
  console.log(`Adding random delay of ${delay.toFixed(2)}ms`);
  await new Promise(resolve => setTimeout(resolve, delay));
};

// Function to check if headline matches emergency keywords
function matchesEmergencyKeywords(headline: string): string[] {
  const lowercaseHeadline = headline.toLowerCase();
  const matchedKeywords: string[] = [];

  // Check if any exclusion keyword is present
  const hasExclusionTerm = EXCLUSION_KEYWORDS.some(keyword => 
    lowercaseHeadline.includes(keyword.toLowerCase())
  );

  // If there's an exclusion term, we need to make sure we also have an India-Pakistan related term
  // Otherwise, only check for emergency keywords
  for (const keyword of EMERGENCY_KEYWORDS) {
    if (lowercaseHeadline.includes(keyword.toLowerCase())) {
      matchedKeywords.push(keyword);
    }
  }

  // If we have exclusion terms, only return matched keywords if we have India-Pakistan related terms
  if (hasExclusionTerm) {
    // Check if any match is India-Pakistan related
    const hasIndoPakMatch = matchedKeywords.some(keyword => 
      keyword.toLowerCase().includes('india') || 
      keyword.toLowerCase().includes('pakistan') || 
      keyword.toLowerCase().includes('indo-pak') ||
      keyword.toLowerCase().includes('loc')
    );
    
    return hasIndoPakMatch ? matchedKeywords : [];
  }

  return matchedKeywords;
}

// Function to clean up old alerts (older than 24 hours)
async function cleanupOldAlerts() {
  try {
    // Calculate timestamp for 24 hours ago
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    
    console.log(`Cleaning up alerts older than ${twentyFourHoursAgo.toISOString()}`);
    
    // Delete old alerts
    const { error } = await supabase
      .from('emergency_alerts')
      .delete()
      .lt('created_at', twentyFourHoursAgo.toISOString());
    
    if (error) {
      console.error("Error cleaning up old alerts:", error);
    } else {
      console.log("Successfully cleaned up old alerts");
    }
  } catch (error) {
    console.error("Exception during cleanup:", error);
  }
}

// Function to store detected alerts in Supabase
async function storeAlerts(alerts: EmergencyAlert[]) {
  if (alerts.length === 0) {
    return;
  }
  
  try {
    console.log(`Attempting to store ${alerts.length} alerts`);
    
    for (const alert of alerts) {
      console.log(`Processing alert: ${alert.title}`);
      
      const { data, error } = await supabase
        .from('emergency_alerts')
        .upsert(
          { 
            title: alert.title, 
            url: alert.url, 
            matched_keywords: alert.matched_keywords 
          },
          { 
            onConflict: 'title',
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

// Function to fetch with retry logic
async function fetchWithRetry(url: string, maxRetries = 3): Promise<Response> {
  let attempt = 0;
  
  while (attempt < maxRetries) {
    try {
      attempt++;
      const startTime = Date.now();
      console.log(`Fetch attempt ${attempt}/${maxRetries} for ${url} at ${new Date().toISOString()}`);
      
      // Add random delay before request to mimic human behavior
      await addRandomDelay();
      
      const response = await fetch(url, {
        headers: getBrowserHeaders(),
        redirect: "follow"
      });
      
      const endTime = Date.now();
      console.log(`Received ${response.status} response in ${endTime - startTime}ms`);
      
      // If successful, return the response
      if (response.ok) {
        return response;
      }
      
      // If we get a 403 or 429, wait longer before retrying
      if (response.status === 403 || response.status === 429) {
        console.log(`Received ${response.status}, site may be blocking requests`);
        const backoffTime = Math.pow(2, attempt) * 1000 + (Math.random() * 1000);
        console.log(`Backing off for ${backoffTime.toFixed(0)}ms before retry`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      } else {
        // For other errors, use simpler backoff
        const backoffTime = attempt * 1000;
        console.log(`Backing off for ${backoffTime}ms before retry`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
      }
    } catch (error) {
      console.error(`Attempt ${attempt} failed with error:`, error.message);
      if (attempt >= maxRetries) throw error;
      
      // Exponential backoff
      const backoffTime = Math.pow(2, attempt) * 1000;
      console.log(`Backing off for ${backoffTime}ms before retry`);
      await new Promise(resolve => setTimeout(resolve, backoffTime));
    }
  }
  
  throw new Error(`Failed to fetch ${url} after ${maxRetries} attempts`);
}

// Function to validate HTML content has expected structure
function validateContent(html: string): boolean {
  const $ = load(html);
  const newsBoxes = $('div.aniBox');
  
  if (newsBoxes.length === 0) {
    console.log("No news boxes found in HTML, content may be invalid or site structure changed");
    console.log(`HTML length: ${html.length} characters`);
    
    // Log a small sample of the HTML to help diagnose issues
    if (html.length > 0) {
      const sampleLength = Math.min(html.length, 500);
      console.log(`HTML sample: ${html.substring(0, sampleLength)}...`);
    }
    
    return false;
  }
  
  console.log(`Found ${newsBoxes.length} news boxes in HTML content`);
  return true;
}

// Check circuit breaker status and reset if needed
function checkCircuitBreaker(): boolean {
  if (!circuitBreakerTripped) {
    return true; // Circuit is closed, we can proceed
  }
  
  const now = Date.now();
  if (now - lastFailureTime > CIRCUIT_BREAKER_TIMEOUT) {
    // Reset circuit breaker after timeout
    console.log("Circuit breaker timeout elapsed, resetting");
    circuitBreakerTripped = false;
    consecutiveFailures = 0;
    return true;
  }
  
  console.log("Circuit breaker is open, skipping scrape attempt");
  return false; // Circuit is open, don't attempt
}

// Update circuit breaker state
function updateCircuitBreaker(success: boolean) {
  if (success) {
    // Reset failure count on success
    consecutiveFailures = 0;
    circuitBreakerTripped = false;
  } else {
    // Increment failure count
    consecutiveFailures++;
    lastFailureTime = Date.now();
    
    // Trip circuit breaker if too many failures
    if (consecutiveFailures >= MAX_FAILURES) {
      console.log(`Circuit breaker tripped after ${consecutiveFailures} consecutive failures`);
      circuitBreakerTripped = true;
    }
  }
}

// Main scraping function
async function scrapeANI() {
  // Check circuit breaker first
  if (!checkCircuitBreaker()) {
    return {
      status: "skipped",
      message: "Scraping temporarily paused due to repeated failures"
    };
  }
  
  try {
    console.log("Starting ANI news scraping...");
    
    // Try each URL in the fallback list
    let html = "";
    let currentUrl = "";
    let validContentFound = false;
    
    for (const url of ANI_URLS) {
      try {
        currentUrl = url;
        console.log(`Trying URL: ${url}`);
        
        // Fetch the HTML content with retry logic
        const response = await fetchWithRetry(url);
        html = await response.text();
        
        console.log(`Received HTML content (${html.length} characters) from ${url}`);
        
        // Validate content before proceeding
        validContentFound = validateContent(html);
        if (validContentFound) {
          console.log(`Valid content found at ${url}`);
          break;
        } else {
          console.log(`Invalid or blocked content at ${url}, trying next URL`);
        }
      } catch (error) {
        console.error(`Failed to fetch from ${url}:`, error.message);
        // Continue to the next URL
      }
    }
    
    if (!validContentFound) {
      throw new Error("Failed to find valid content on any URL");
    }
    
    const $ = load(html);
    
    // Extract headlines
    const headlines: EmergencyAlert[] = [];
    
    // Target the main news container
    $('div.aniBox').each((_, element) => {
      const headlineElement = $(element).find('h6 a');
      const title = headlineElement.text().trim();
      const url = headlineElement.attr('href') || "";
      
      if (title && url) {
        const matchedKeywords = matchesEmergencyKeywords(title);
        if (matchedKeywords.length > 0) {
          headlines.push({
            title,
            url,
            matched_keywords: matchedKeywords
          });
        }
      }
    });
    
    console.log(`Found ${headlines.length} emergency headlines`);
    
    // Store alerts in Supabase
    await storeAlerts(headlines);
    
    // Clean up old alerts
    await cleanupOldAlerts();
    
    // Update circuit breaker - success
    updateCircuitBreaker(true);
    
    return {
      status: "success",
      message: `Processed ${headlines.length} emergency headlines`,
      source_url: currentUrl,
      headlines
    };
  } catch (error) {
    console.error("Error scraping ANI news:", error);
    
    // Update circuit breaker - failure
    updateCircuitBreaker(false);
    
    return {
      status: "error",
      message: error.message
    };
  }
}

// CORS headers for API responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
    const startTime = Date.now();
    console.log(`Scraping request received at ${new Date().toISOString()}`);
    
    const result = await scrapeANI();
    const endTime = Date.now();
    
    console.log(`Scraping completed in ${endTime - startTime}ms with status: ${result.status}`);
    
    return new Response(JSON.stringify(result), {
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error("Error in endpoint handler:", error);
    return new Response(JSON.stringify({ 
      status: "error",
      message: "Internal server error"
    }), {
      status: 500,
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  }
});
