
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CACHE_TIME = 60 * 5; // Cache for 5 minutes
let lastFetchTime = 0;
let cachedTweets: any[] = [];

async function fetchANITweets() {
  try {
    const response = await fetch(
      "https://rsshub.app/twitter/user/ANI/excludeReplies=1&includeRts=0",
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; Lovable/1.0)",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch tweets: ${response.statusText}`);
    }

    const text = await response.text();
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, "text/xml");

    const items = xmlDoc.querySelectorAll("item");
    const currentTime = Date.now();
    const oneHourAgo = currentTime - 60 * 60 * 1000;

    const tweets = Array.from(items)
      .map((item) => {
        const title = item.querySelector("title")?.textContent || "";
        const link = item.querySelector("link")?.textContent || "";
        const pubDate = item.querySelector("pubDate")?.textContent || "";
        const pubTime = new Date(pubDate).getTime();
        const guid = item.querySelector("guid")?.textContent || "";

        const isAlert =
          title.toLowerCase().includes("alert") ||
          title.toLowerCase().includes("breaking");

        return {
          id: guid.split("/").pop() || "",
          text: title,
          created_at: pubDate,
          timestamp: pubTime,
          link: link,
          isAlert: isAlert,
        };
      })
      .filter((tweet) => tweet.timestamp >= oneHourAgo);

    return tweets;
  } catch (error) {
    console.error("Error fetching tweets:", error);
    throw error;
  }
}

// CORS headers for all responses
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // Ideally restrict to your frontend domain
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
  "Access-Control-Max-Age": "86400", // 24 hours cache for preflight requests
};

serve(async (req) => {
  // Handle preflight OPTIONS request properly
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204, // No content for OPTIONS
      headers: corsHeaders,
    });
  }

  try {
    const currentTime = Date.now();

    if (
      currentTime - lastFetchTime > CACHE_TIME * 1000 ||
      cachedTweets.length === 0
    ) {
      console.log("Cache expired or empty, fetching fresh tweets");
      cachedTweets = await fetchANITweets();
      lastFetchTime = currentTime;
    } else {
      console.log("Serving tweets from cache");
    }

    return new Response(JSON.stringify(cachedTweets), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "max-age=300",
      },
    });
  } catch (error) {
    console.error("Error in edge function:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch tweets" }),
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
