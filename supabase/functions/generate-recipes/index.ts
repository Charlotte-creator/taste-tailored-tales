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
    const { mode, ingredientText, imageData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Processing request:", { mode, hasText: !!ingredientText, hasImage: !!imageData });

    // Mode 1: Extract ingredients from image
    if (mode === "extract" && imageData) {
      const content = [
        {
          type: "text",
          text: "You are a professional chef. Analyze this fridge photo and list ALL visible food ingredients. Return ONLY the ingredient names, separated by commas. Be specific and include quantities when visible (e.g., '3 eggs', '1 onion'). Do not include basic pantry items like oil, salt, or black pepper."
        },
        {
          type: "image_url",
          image_url: {
            url: imageData
          }
        }
      ];

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content }],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI gateway error:", response.status, errorText);
        throw new Error(`AI gateway error: ${response.status}`);
      }

      const data = await response.json();
      const ingredientsText = data.choices[0].message.content;
      const ingredients = ingredientsText.split(',').map((i: string) => i.trim()).filter(Boolean);
      
      return new Response(
        JSON.stringify({ ingredients }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Mode 2: Generate recipes from ingredients
    if (mode === "generate") {
      const basicIngredients = "oil, salt, black pepper";
      const allIngredients = ingredientText 
        ? `${ingredientText}, ${basicIngredients}`
        : basicIngredients;

      const prompt = `You are a professional chef. Create 3 creative, practical recipes using these ingredients: ${allIngredients}

IMPORTANT: Assume the user has basic ingredients (oil, salt, black pepper) and DON'T list them as missing.

For each recipe, provide:
1. Recipe name
2. Estimated cooking time (e.g., '25 min')
3. Estimated calories (e.g., '~450 cal')
4. List of ingredients needed
5. Missing ingredients (exclude oil, salt, black pepper)
6. Step-by-step instructions

Format as JSON:
{
  "recipes": [
    {
      "name": "Recipe Name",
      "cookingTime": "30 min",
      "calories": "~500 cal",
      "ingredients": ["ingredient 1", "ingredient 2"],
      "missingIngredients": ["missing ingredient 1"],
      "instructions": ["step 1", "step 2"]
    }
  ]
}`;

      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [{ role: "user", content: prompt }],
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
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
        const jsonString = jsonMatch ? jsonMatch[1] : content;
        recipeData = JSON.parse(jsonString);
      } catch (e) {
        console.error("Failed to parse recipe JSON:", e);
        recipeData = {
          recipes: [
            {
              name: "Quick Recipe Suggestion",
              cookingTime: "30 min",
              calories: "~500 cal",
              ingredients: allIngredients.split(",").map((i: string) => i.trim()),
              missingIngredients: [],
              instructions: [
                "Due to a parsing error, please try again or adjust your ingredient list.",
                "Make sure to provide clear ingredient names."
              ]
            }
          ]
        };
      }

      // Generate images for each recipe
      console.log("Generating images for recipes...");
      const recipesWithImages = await Promise.all(
        recipeData.recipes.map(async (recipe: any) => {
          try {
            const imagePrompt = `A professional food photography shot of ${recipe.name}, beautifully plated on a white ceramic dish with garnish, overhead view, natural lighting, appetizing and colorful, high quality food photo`;
            
            const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${LOVABLE_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "google/gemini-2.5-flash-image",
                messages: [
                  {
                    role: "user",
                    content: imagePrompt
                  }
                ],
                modalities: ["image", "text"]
              }),
            });

            if (imageResponse.ok) {
              const imageData = await imageResponse.json();
              const imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
              
              if (imageUrl) {
                console.log(`Image generated successfully for ${recipe.name}`);
                return { ...recipe, image: imageUrl };
              }
            }
            
            console.warn(`Failed to generate image for ${recipe.name}, using fallback`);
            return recipe;
          } catch (imageError) {
            console.error(`Error generating image for ${recipe.name}:`, imageError);
            return recipe;
          }
        })
      );

      return new Response(
        JSON.stringify({ recipes: recipesWithImages }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error("Invalid mode or missing parameters");

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
