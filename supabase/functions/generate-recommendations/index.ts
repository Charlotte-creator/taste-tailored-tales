import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { preferences, count = 5 } = await req.json();
    console.log("Generating recommendations with preferences:", preferences);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build a comprehensive prompt from the preferences
    const prompt = `Generate ${count} realistic restaurant meal recommendations based on these user preferences:

Cuisine Preferences: ${preferences.cuisineVariety || "varied cuisines"}
Allergies/Restrictions: ${preferences.allergies?.join(", ") || "none"}
Dining Context: ${preferences.diningContext || "casual"}
Priority: ${preferences.priority || "comfort"}
Budget: $${preferences.budget || 50} per meal
Max Travel Time: ${preferences.travelTime || 30} minutes
Additional Constraints: ${JSON.stringify(preferences.constraints || {})}

Generate diverse, realistic restaurant recommendations that match these preferences. For each recommendation, provide:
- Dish name (creative but realistic)
- Restaurant name
- Cuisine type
- Dietary safety info (must avoid: ${preferences.allergies?.join(", ") || "none"})
- Price range ($, $$, or $$$)
- Estimated delivery time (in minutes, under ${preferences.travelTime || 30} min)
- Distance (in miles, realistic for delivery)
- Total price (realistic, within budget)
- Why this matches their preferences

Make the recommendations diverse in cuisine types and appealing. Use realistic restaurant and dish names.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a food recommendation expert. Generate realistic, appealing restaurant recommendations in JSON format."
          },
          { role: "user", content: prompt }
        ],
        tools: [{
          type: "function",
          function: {
            name: "generate_recommendations",
            description: "Generate restaurant meal recommendations",
            parameters: {
              type: "object",
              properties: {
                recommendations: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string", description: "Dish name" },
                      restaurant: { type: "string", description: "Restaurant name" },
                      cuisine: { type: "string", description: "Cuisine type" },
                      dietSafe: { 
                        type: "array", 
                        items: { type: "string" },
                        description: "Dietary accommodations"
                      },
                      price: { 
                        type: "string", 
                        enum: ["$", "$$", "$$$"],
                        description: "Price range indicator"
                      },
                      eta: { type: "string", description: "Estimated delivery time like '15 min'" },
                      distance: { type: "string", description: "Distance like '0.8 mi'" },
                      totalPrice: { type: "string", description: "Total price like '$16.50'" },
                      why: { type: "string", description: "Why this matches their preferences" }
                    },
                    required: ["name", "restaurant", "cuisine", "dietSafe", "price", "eta", "distance", "totalPrice", "why"],
                    additionalProperties: false
                  }
                }
              },
              required: ["recommendations"],
              additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "generate_recommendations" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI Response:", JSON.stringify(data, null, 2));

    // Extract the recommendations from the tool call
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== "generate_recommendations") {
      throw new Error("Invalid response format from AI");
    }

    const recommendations = JSON.parse(toolCall.function.arguments).recommendations;

    // Add IDs and image URLs to recommendations
    const enhancedRecommendations = recommendations.map((rec: any, index: number) => ({
      id: index + 1,
      ...rec,
      image: getImageForCuisine(rec.cuisine),
      calories: generateCalories(rec.price)
    }));

    return new Response(
      JSON.stringify({ recommendations: enhancedRecommendations }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating recommendations:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function getImageForCuisine(cuisine: string): string {
  const cuisineImages: Record<string, string> = {
    "Asian": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800",
    "Asian Fusion": "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800",
    "Italian": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800",
    "Mexican": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800",
    "American": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800",
    "Mediterranean": "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=800",
    "Healthy": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
    "Indian": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800",
    "Japanese": "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800",
    "Thai": "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=800"
  };
  
  return cuisineImages[cuisine] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800";
}

function generateCalories(price: string): string {
  const ranges: Record<string, string> = {
    "$": "~400-600 cal",
    "$$": "~550-750 cal",
    "$$$": "~700-900 cal"
  };
  return ranges[price] || "~550 cal";
}
