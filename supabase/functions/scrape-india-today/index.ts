import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";
import { load } from "https://esm.sh/cheerio@1.0.0-rc.12";
import { EMERGENCY_KEYWORDS, EXCLUSION_KEYWORDS } from "../scrape-ani-news/constants.ts";

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
const IT_URLS = [
  "https://www.indiatoday.in/india",
  "https://www.indiatoday.in/news",
  "https://www.indiatoday.in/"
];

// Base URL for completing relative URLs
const IT_BASE_URL = "https://www.indiatoday.in";

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
    "Referer": "https://www.indiatoday.in/",
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

// Function to clean up headline text
function cleanHeadlineText(text: string): string {
  if (!text) return '';
  
  // Decode HTML entities
  const decodedText = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
  
  // Remove any remaining HTML tags
  const noTagsText = decodedText.replace(/<\/?[^>]+(>|$)/g, '');
  
  // Trim and normalize whitespace
  return noTagsText
    .trim()
    .replace(/\s+/g, ' ');
}

// Function to resolve relative URLs
function resolveUrl(url: string): string {
  if (!url) return '';
  
  // Skip empty or javascript URLs
  if (!url || url === '#' || url.startsWith('javascript:')) {
    return '';
  }
  
  // Already absolute URL
  if (url.startsWith('http')) {
    return url;
  }
  
  // Relative URL - add base
  return `${IT_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

// Function to validate a headline
function isValidHeadline(title: string, url: string): boolean {
  // Title checks
  if (!title || title.length < 10 || title.length > 300) {
    return false;
  }
  
  // Skip common non-news links
  const skipWords = ['about us', 'contact us', 'privacy policy', 'terms', 'read more', 'click here', 'view more'];
  if (skipWords.some(word => title.toLowerCase().includes(word))) {
    return false;
  }
  
  // URL checks
  if (!url || url === '#' || url.startsWith('javascript:')) {
    return false;
  }
  
  return true;
}

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

// Function to store detected alerts in Supabase
async function storeAlerts(alerts: EmergencyAlert[]) {
  if (alerts.length === 0) {
    return;
  }
  
  try {
    console.log(`Attempting to store ${alerts.length} alerts from India Today`);
    
    for (const alert of alerts) {
      console.log(`Processing alert: ${alert.title}`);
      
      const { data, error } = await supabase
        .from('emergency_alerts')
        .upsert(
          { 
            title: alert.title, 
            url: alert.url, 
            matched_keywords: alert.matched_keywords,
            source: 'India Today'
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

// Multiple selector strategies for finding headlines - India Today specific
function extractHeadlinesWithMultipleSelectors($: cheerio.CheerioAPI) {
  const headlineCandidates: { title: string; url: string }[] = [];
  const foundSelectors: Record<string, number> = {};
  
  // Strategy 1: Target h2 tags which contain headlines in India Today
  console.log("Trying Strategy 1: h2 Headlines in India Today");
  ['h2'].forEach(headingTag => {
    const headings = $(`${headingTag} a`);
    foundSelectors[`${headingTag} links`] = headings.length;
    
    headings.each((_, element) => {
      const title = cleanHeadlineText($(element).text());
      const url = resolveUrl($(element).attr('href') || '');
      
      if (isValidHeadline(title, url)) {
        headlineCandidates.push({ title, url });
      }
    });
    
    // Also check for headings that wrap links
    const headingsWrappingLinks = $(`a ${headingTag}`);
    foundSelectors[`links with ${headingTag}`] = headingsWrappingLinks.length;
    
    headingsWrappingLinks.each((_, element) => {
      const parentLink = $(element).parent('a');
      if (parentLink.length > 0) {
        const title = cleanHeadlineText($(element).text());
        const url = resolveUrl(parentLink.attr('href') || '');
        
        if (isValidHeadline(title, url)) {
          headlineCandidates.push({ title, url });
        }
      }
    });
  });
  
  // Strategy 2: Look for specific India Today article containers
  console.log("Trying Strategy 2: India Today article containers");
  const articleSelectors = [
    '.detail', '.list-item', '.catagory-listing', '.story__grid',
    '[class*="story"]', '[class*="article"]', '[class*="news"]'
  ];
  
  articleSelectors.forEach(selector => {
    const articles = $(selector);
    foundSelectors[selector] = articles.length;
    
    articles.each((_, article) => {
      // Try to find heading in this article container
      const headingEl = $(article).find('h2, h3, h1').first();
      
      // If heading has a link, extract from that
      const linkEl = headingEl.find('a').first();
      if (linkEl.length > 0) {
        const title = cleanHeadlineText(linkEl.text());
        const url = resolveUrl(linkEl.attr('href') || '');
        
        if (isValidHeadline(title, url)) {
          headlineCandidates.push({ title, url });
        }
      } else if (headingEl.length > 0) {
        // If heading doesn't have a link, try to find a standalone link
        const title = cleanHeadlineText(headingEl.text());
        const nearestLink = $(article).find('a').first();
        const url = resolveUrl(nearestLink.attr('href') || '');
        
        if (isValidHeadline(title, url)) {
          headlineCandidates.push({ title, url });
        }
      }
    });
  });
  
  // Strategy 3: Fallback to any headings with links
  console.log("Trying Strategy 3: Any headings with links");
  ['h1', 'h2', 'h3', 'h4'].forEach(headingTag => {
    const headings = $(`${headingTag} a`);
    foundSelectors[`any ${headingTag}`] = headings.length;
    
    headings.each((_, element) => {
      const title = cleanHeadlineText($(element).text());
      const url = resolveUrl($(element).attr('href') || '');
      
      if (isValidHeadline(title, url)) {
        headlineCandidates.push({ title, url });
      }
    });
  });
  
  // Strategy 4: Links with title attributes or heading-like classes
  console.log("Trying Strategy 4: Links with title attributes");
  const titleLinks = $('a[title], a.title, a.headline, a.heading');
  foundSelectors['links with title'] = titleLinks.length;
  
  titleLinks.each((_, element) => {
    const linkEl = $(element);
    const title = cleanHeadlineText(linkEl.attr('title') || linkEl.text());
    const url = resolveUrl(linkEl.attr('href') || '');
    
    if (isValidHeadline(title, url)) {
      headlineCandidates.push({ title, url });
    }
  });
  
  // Log selector effectiveness
  console.log("Selector effectiveness:");
  for (const [selector, count] of Object.entries(foundSelectors)) {
    console.log(`- ${selector}: ${count} elements found`);
  }
  
  // Remove duplicates based on title
  const uniqueHeadlines: { title: string; url: string }[] = [];
  const uniqueTitles = new Set();
  
  headlineCandidates.forEach(candidate => {
    if (!uniqueTitles.has(candidate.title)) {
      uniqueTitles.add(candidate.title);
      uniqueHeadlines.push(candidate);
    }
  });
  
  console.log(`Found ${uniqueHeadlines.length} unique headlines after filtering from ${headlineCandidates.length} candidates`);
  
  // Log a sample of found headlines for debugging
  if (uniqueHeadlines.length > 0) {
    console.log("Sample headlines:");
    uniqueHeadlines.slice(0, 5).forEach(headline => {
      console.log(`- "${headline.title}" (${headline.url})`);
    });
  }
  
  return uniqueHeadlines;
}

// Function to validate HTML content has expected structure
function validateContent(html: string): boolean {
  const $ = load(html);
  
  // Try multiple validation strategies specific to India Today
  const strategies = [
    { selector: 'h2 a, a h2, h1 a', name: 'Headline Links' },
    { selector: '.detail, .list-item, .catagory-listing', name: 'Article Containers' },
    { selector: '.top-takes, .top-news', name: 'Top News Section' }
  ];
  
  for (const strategy of strategies) {
    const elements = $(strategy.selector);
    console.log(`Validation: Found ${elements.length} ${strategy.name}`);
    
    if (elements.length > 0) {
      console.log(`Content validated using ${strategy.name}`);
      return true;
    }
  }
  
  console.log("No news content structures found in HTML");
  console.log(`HTML length: ${html.length} characters`);
  
  // Log a small sample of the HTML to help diagnose issues
  if (html.length > 0) {
    const sampleLength = Math.min(html.length, 500);
    console.log(`HTML sample: ${html.substring(0, sampleLength)}...`);
  }
  
  return false;
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

// Main scraping function for India Today
async function scrapeIndiaToday() {
  // Check circuit breaker first
  if (!checkCircuitBreaker()) {
    return {
      status: "skipped",
      message: "Scraping temporarily paused due to repeated failures"
    };
  }
  
  try {
    console.log("Starting India Today news scraping...");
    
    // Try each URL in the fallback list
    let html = "";
    let currentUrl = "";
    let validContentFound = false;
    
    for (const url of IT_URLS) {
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
    
    // Extract headlines using multiple strategies
    const extractedHeadlines = extractHeadlinesWithMultipleSelectors($);
    
    // Filter headlines for emergency terms
    const emergencyHeadlines: EmergencyAlert[] = extractedHeadlines
      .map(({ title, url }) => {
        const matchedKeywords = matchesEmergencyKeywords(title);
        return matchedKeywords.length > 0 ? { title, url, matched_keywords: matchedKeywords } : null;
      })
      .filter((headline): headline is EmergencyAlert => headline !== null);
    
    console.log(`Found ${emergencyHeadlines.length} emergency headlines out of ${extractedHeadlines.length} total headlines`);
    
    // Store alerts in Supabase
    await storeAlerts(emergencyHeadlines);
    
    // Update circuit breaker - success
    updateCircuitBreaker(true);
    
    return {
      status: "success",
      message: `Processed ${emergencyHeadlines.length} emergency headlines`,
      source_url: currentUrl,
      headlines: emergencyHeadlines
    };
  } catch (error) {
    console.error("Error scraping India Today news:", error);
    
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
    
    const result = await scrapeIndiaToday();
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
