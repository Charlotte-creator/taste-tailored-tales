import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { foods, allergies } = await req.json();
    console.log("Generating taste profile for:", { foods, allergies });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build the prompt based on user data
    let prompt = "Analyze the following food preferences and create a structured profile:\n\n";
    
    if (foods && foods.length > 0) {
      const foodNames = foods
        .filter((f: any) => f.name)
        .map((f: any) => f.name)
        .join(", ");
      if (foodNames) {
        prompt += `Favorite foods: ${foodNames}\n`;
      }
    }
    
    if (allergies && allergies.length > 0) {
      prompt += `Allergies to avoid: ${allergies.join(", ")}\n`;
    }
    
    prompt += "\nProvide insights on their nutrition balance, cuisine variety preferences, and personalized suggestions.";

    console.log("Sending prompt to AI:", prompt);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a nutritionist analyzing food preferences to provide personalized insights."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_taste_profile",
              description: "Generate a structured taste profile with nutrition, variety, and suggestions",
              parameters: {
                type: "object",
                properties: {
                  nutrition_balance: {
                    type: "string",
                    description: "2-3 sentences about their nutritional balance and dietary patterns"
                  },
                  cuisine_variety: {
                    type: "string",
                    description: "2-3 sentences about the variety and types of cuisines they enjoy"
                  },
                  suggestions: {
                    type: "string",
                    description: "2-3 sentences with personalized recommendations to improve their diet"
                  }
                },
                required: ["nutrition_balance", "cuisine_variety", "suggestions"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "create_taste_profile" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log("AI response:", data);

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    const profile = toolCall?.function?.arguments ? JSON.parse(toolCall.function.arguments) : null;

    if (!profile) {
      throw new Error("Failed to generate structured profile");
    }

    return new Response(
      JSON.stringify({ 
        nutrition_balance: profile.nutrition_balance,
        cuisine_variety: profile.cuisine_variety,
        suggestions: profile.suggestions
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-taste-profile:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error occurred" 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
