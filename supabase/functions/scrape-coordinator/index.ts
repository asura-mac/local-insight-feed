
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";

// Get Supabase client using environment variables
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Create Supabase client with admin privileges (service role key)
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

// Function to call a scraper function and handle its response
async function callScraper(functionName: string) {
  console.log(`Calling ${functionName} function...`);
  
  try {
    const { data, error } = await supabase.functions.invoke(functionName);
    
    if (error) {
      console.error(`Error calling ${functionName}:`, error);
      return {
        status: 'error',
        source: functionName,
        message: error.message
      };
    }
    
    console.log(`${functionName} completed with status: ${data.status}`);
    return {
      status: data.status,
      source: functionName,
      message: data.message,
      headlines: data.headlines || []
    };
  } catch (error) {
    console.error(`Exception calling ${functionName}:`, error);
    return {
      status: 'error',
      source: functionName,
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
    console.log(`Coordinator started at ${new Date().toISOString()}`);
    
    // Call all scrapers with delays between them
    const results = [];
    
    // Call ANI News scraper
    results.push(await callScraper('scrape-ani-news'));
    
    // Add delay before next scraper
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Call Economic Times scraper
    results.push(await callScraper('scrape-economic-times'));
    
    // Add delay before next scraper
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Call India Today scraper
    results.push(await callScraper('scrape-india-today'));
    
    // Add delay before next scraper
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Call MoneyControl scraper
    results.push(await callScraper('scrape-moneycontrol'));
    
    // Clean up old alerts
    await cleanupOldAlerts();
    
    const endTime = Date.now();
    console.log(`Coordinator completed in ${endTime - startTime}ms`);
    
    // Return summary of all scraper results
    return new Response(JSON.stringify({
      status: 'success',
      message: 'All scrapers executed',
      execution_time_ms: endTime - startTime,
      results
    }), {
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error("Error in coordinator handler:", error);
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
