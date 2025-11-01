import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Loader2, ShoppingCart, Heart } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import BackButton from "@/components/BackButton";

interface Recipe {
  id?: string;
  name: string;
  ingredients: string[];
  instructions: string[];
  missingIngredients?: string[];
  liked?: boolean;
}

const CookAtHome = () => {
  const navigate = useNavigate();
  const [ingredientText, setIngredientText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateRecipes = async () => {
    if (!ingredientText && !imageFile) {
      toast.error("Please enter ingredients or upload an image");
      return;
    }

    setIsLoading(true);

    try {
      // Convert image to base64 if exists
      let imageData = null;
      if (imageFile && imagePreview) {
        imageData = imagePreview;
      }

      const { data, error } = await supabase.functions.invoke("generate-recipes", {
        body: {
          ingredientText,
          imageData,
        },
      });

      if (error) throw error;

      setRecipes(data.recipes || []);
      toast.success("Recipes generated successfully!");
    } catch (error) {
      console.error("Error generating recipes:", error);
      toast.error("Failed to generate recipes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderIngredients = (missingIngredients: string[]) => {
    const ingredientList = missingIngredients.join(", ");
    toast.success("Opening delivery app...");
    // In a real app, this would open UberEats/HelloFresh with the ingredient list
    console.log("Ordering:", ingredientList);
  };

  const handleLikeRecipe = async (recipe: Recipe, index: number) => {
    try {
      // For now, use a guest user ID. In production, this would use auth.uid()
      const userId = 'guest';
      
      if (recipe.liked) {
        // Unlike recipe - remove from localStorage for now
        toast.success("Recipe removed from favorites");
      } else {
        // Like recipe - save to database
        const { error } = await supabase.from('liked_recipes').insert({
          user_id: userId,
          recipe_name: recipe.name,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          missing_ingredients: recipe.missingIngredients || []
        });

        if (error) throw error;
        toast.success("Recipe saved to favorites!");
      }

      // Update local state
      setRecipes(recipes.map((r, i) => 
        i === index ? { ...r, liked: !r.liked } : r
      ));
    } catch (error) {
      console.error("Error liking recipe:", error);
      toast.error("Failed to save recipe");
    }
  };

  return (
    <div className="min-h-screen hexagon-pattern flex flex-col p-6">
      <BackButton />
      <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col justify-between py-12 animate-in fade-in duration-500">
        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
          <div className="h-full bg-[hsl(var(--crumble-dark))] w-4/5 transition-all duration-300" />
        </div>

        {/* Content */}
        <div className="space-y-8 flex-1 flex flex-col justify-center mt-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-[hsl(var(--crumble-dark))]">
              What's in Your Kitchen?
            </h1>
            <p className="text-foreground/70">
              Upload a photo of your fridge or list your ingredients
            </p>
          </div>

          {!recipes.length ? (
            <div className="space-y-6">
              {/* Image Upload */}
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4 text-[hsl(var(--crumble-dark))]">
                  Upload Fridge Photo
                </h3>
                <div className="space-y-4">
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-primary/30 rounded-lg cursor-pointer hover:border-primary transition-colors bg-white">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Fridge preview"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <Upload className="w-12 h-12 text-primary/50 mb-2" />
                        <p className="text-sm text-foreground/70">
                          Click to upload your fridge photo
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </Card>

              {/* Text Input */}
              <Card className="p-6">
                <h3 className="font-semibold text-lg mb-4 text-[hsl(var(--crumble-dark))]">
                  Or List Your Ingredients
                </h3>
                <Textarea
                  placeholder="e.g., chicken breast, tomatoes, pasta, garlic, olive oil..."
                  value={ingredientText}
                  onChange={(e) => setIngredientText(e.target.value)}
                  className="min-h-32"
                />
              </Card>

              <Button
                onClick={handleGenerateRecipes}
                disabled={isLoading}
                size="lg"
                className="w-full"
                variant="dark"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing Ingredients...
                  </>
                ) : (
                  "Generate Recipes"
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-[hsl(var(--crumble-dark))]">
                  Recipe Suggestions
                </h2>
                <Button
                  variant="outline"
                  onClick={() => {
                    setRecipes([]);
                    setImageFile(null);
                    setImagePreview(null);
                    setIngredientText("");
                  }}
                >
                  Start Over
                </Button>
              </div>

              {recipes.map((recipe, index) => (
                <Card key={index} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-[hsl(var(--crumble-dark))]">
                      {recipe.name}
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleLikeRecipe(recipe, index)}
                      className={recipe.liked ? "text-red-500" : "text-foreground/50"}
                    >
                      <Heart className={`w-6 h-6 ${recipe.liked ? "fill-current" : ""}`} />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Ingredients:</h4>
                      <ul className="list-disc list-inside space-y-1 text-foreground/70">
                        {recipe.ingredients.map((ing, i) => (
                          <li key={i}>{ing}</li>
                        ))}
                      </ul>
                    </div>

                    {recipe.missingIngredients && recipe.missingIngredients.length > 0 && (
                      <div className="bg-accent/10 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2 text-accent">
                          Missing Ingredients:
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-foreground/70 mb-3">
                          {recipe.missingIngredients.map((ing, i) => (
                            <li key={i}>{ing}</li>
                          ))}
                        </ul>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => handleOrderIngredients(recipe.missingIngredients!)}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            UberEats
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1"
                            onClick={() => window.open("https://www.hellofresh.com", "_blank")}
                          >
                            HelloFresh
                          </Button>
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="font-semibold mb-2">Instructions:</h4>
                      <ol className="list-decimal list-inside space-y-1 text-foreground/70">
                        {recipe.instructions.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </Card>
              ))}

              <Button
                onClick={() => navigate("/home")}
                size="lg"
                className="w-full"
                variant="dark"
              >
                Continue to Home
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CookAtHome;
