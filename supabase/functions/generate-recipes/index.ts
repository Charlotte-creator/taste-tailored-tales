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
    const { ingredientText, imageData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating recipes with:", { 
      hasText: !!ingredientText, 
      hasImage: !!imageData 
    });

    // Build the content for the AI request
    const content = [];
    
    let prompt = "You are a professional chef. Analyze the provided ingredients and generate 3 creative, practical recipes.";
    
    if (imageData) {
      prompt += " The user has provided a photo of their fridge. Identify all visible ingredients and use them.";
      content.push({
        type: "text",
        text: prompt + (ingredientText ? `\n\nAdditional ingredients mentioned: ${ingredientText}` : "")
      });
      content.push({
        type: "image_url",
        image_url: {
          url: imageData
        }
      });
    } else {
      prompt += `\n\nAvailable ingredients: ${ingredientText}`;
      content.push({
        type: "text",
        text: prompt
      });
    }

    content.push({
      type: "text",
      text: "\n\nFor each recipe, provide:\n1. Recipe name\n2. List of ingredients (mark any missing ingredients)\n3. Step-by-step instructions\n\nFormat your response as JSON with this structure:\n{\n  \"recipes\": [\n    {\n      \"name\": \"Recipe Name\",\n      \"ingredients\": [\"ingredient 1\", \"ingredient 2\"],\n      \"missingIngredients\": [\"missing ingredient 1\"],\n      \"instructions\": [\"step 1\", \"step 2\"]\n    }\n  ]\n}"
    });

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
            role: "user",
            content: content
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received");

    let recipeData;
    try {
      const content = data.choices[0].message.content;
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      recipeData = JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse recipe JSON:", e);
      // Fallback response
      recipeData = {
        recipes: [
          {
            name: "Quick Recipe Suggestion",
            ingredients: ingredientText?.split(",").map((i: string) => i.trim()) || ["Check your ingredients"],
            missingIngredients: [],
            instructions: [
              "Due to a parsing error, please try again or adjust your ingredient list.",
              "Make sure to provide clear ingredient names."
            ]
          }
        ]
      };
    }

    return new Response(
      JSON.stringify(recipeData),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in generate-recipes function:", error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
