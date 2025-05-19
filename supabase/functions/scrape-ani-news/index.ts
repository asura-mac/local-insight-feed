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

// Main scraping function
async function scrapeANI() {
  try {
    console.log("Starting ANI news scraping...");
    const ANI_URL = "https://aninews.in/news/national/";
    
    // Fetch the HTML content
    const response = await fetch(ANI_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch ANI News: ${response.status}`);
    }
    
    const html = await response.text();
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
    
    return {
      status: "success",
      message: `Processed ${headlines.length} emergency headlines`,
      headlines
    };
  } catch (error) {
    console.error("Error scraping ANI news:", error);
    return {
      status: "error",
      message: error.message
    };
  }
}

// Endpoint handler
Deno.serve(async (_req) => {
  try {
    const result = await scrapeANI();
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error in endpoint handler:", error);
    return new Response(JSON.stringify({ 
      status: "error",
      message: "Internal server error"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});
