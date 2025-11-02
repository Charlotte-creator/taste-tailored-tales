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
    const { foodImages, allergies } = await req.json();
    console.log("Generating taste profile from", foodImages?.length || 0, "images");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!foodImages || foodImages.length === 0) {
      // Return a default profile if no images
      return new Response(
        JSON.stringify({
          nutrition_balance: "We'll learn more about your nutrition preferences as you add food photos and interact with the app.",
          cuisine_variety: "Share some photos of your favorite foods to help us understand your cuisine preferences better.",
          suggestions: "Start by uploading photos of meals you enjoy to get personalized recommendations tailored to your taste."
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build the prompt for vision analysis
    let prompt = "Analyze these food images and create a personalized taste profile. ";
    
    if (allergies && allergies.length > 0) {
      prompt += `The user has allergies to: ${allergies.join(", ")}. `;
    }
    
    prompt += "Based on the foods shown, provide detailed insights about their taste preferences.";

    // Build content array with images
    const content: any[] = [
      {
        type: "text",
        text: prompt
      }
    ];

    // Add each food image
    for (const imageData of foodImages) {
      // Remove data URL prefix if present
      const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, "");
      content.push({
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${base64Data}`
        }
      });
    }

    console.log("Sending", content.length - 1, "images to AI for analysis");

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
            content: "You are a friendly nutritionist analyzing food images to provide personalized taste insights. IMPORTANT: Always address the person directly using 'you' and 'your' - never refer to them as 'the user'. Write as if you're speaking directly to them in a warm, personal way."
          },
          {
            role: "user",
            content: content
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_taste_profile",
              description: "Generate a structured taste profile with nutrition, variety, and suggestions based on food images",
              parameters: {
                type: "object",
                properties: {
                  nutrition_balance: {
                    type: "string",
                    description: "2-3 sentences analyzing their nutritional balance and dietary patterns. Must start naturally without phrases like 'The user' or 'You have'. Example: 'You enjoy a balanced mix of proteins and carbs...' or 'Your meals show a preference for...'"
                  },
                  cuisine_variety: {
                    type: "string",
                    description: "2-3 sentences about the variety and types of cuisines they enjoy. Must use 'you' language. Example: 'You seem to enjoy a mix of classic American cuisine...' or 'Your taste leans towards...'"
                  },
                  suggestions: {
                    type: "string",
                    description: "2-3 sentences with personalized recommendations. Must address them directly with 'you'. Example: 'To add more variety, you might try...' or 'Consider exploring...' Never start with 'Given the user' or similar phrases."
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
    console.log("AI response:", JSON.stringify(data, null, 2));

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No tool call found in AI response");
    }

    console.log("Tool call arguments:", toolCall.function?.arguments);

    const profile = toolCall?.function?.arguments ? JSON.parse(toolCall.function.arguments) : null;

    if (!profile) {
      throw new Error("Failed to parse profile from tool call");
    }

    console.log("Parsed profile:", profile);

    // Validate that all required fields are present and non-empty
    if (!profile.nutrition_balance || !profile.cuisine_variety || !profile.suggestions) {
      throw new Error("Profile is missing required fields");
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
