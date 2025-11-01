import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, Loader2, ShoppingCart, Heart, X, Check, Clock, Flame, ChefHat } from "lucide-react";
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
  cookingTime?: string;
  calories?: string;
  image?: string;
}

const CookAtHome = () => {
  const navigate = useNavigate();
  const [ingredientText, setIngredientText] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

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

  const handleSwipe = async (direction: "left" | "right") => {
    const currentRecipe = recipes[currentIndex];
    
    if (direction === "right") {
      // Like and show instructions
      try {
        const userId = 'guest';
        const { error } = await supabase.from('liked_recipes').insert({
          user_id: userId,
          recipe_name: currentRecipe.name,
          ingredients: currentRecipe.ingredients,
          instructions: currentRecipe.instructions,
          missing_ingredients: currentRecipe.missingIngredients || []
        });

        if (error) throw error;
        
        setSelectedRecipe(currentRecipe);
        setShowInstructions(true);
        toast.success("Recipe saved to favorites!");
      } catch (error) {
        console.error("Error saving recipe:", error);
        toast.error("Failed to save recipe");
      }
    } else {
      // Skip to next
      moveToNextRecipe();
    }
  };

  const moveToNextRecipe = () => {
    setTimeout(() => {
      if (currentIndex < recipes.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setCurrentIndex(0);
      }
    }, 300);
  };

  const handleKeepSwiping = () => {
    setShowInstructions(false);
    setSelectedRecipe(null);
    moveToNextRecipe();
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
            <>
              {/* Instructions Detail View */}
              {showInstructions && selectedRecipe && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary via-accent to-primary animate-in fade-in duration-500 overflow-y-auto">
                  <div className="w-full max-w-2xl p-6 animate-in scale-in duration-500">
                    <div className="text-center space-y-6 mb-8">
                      <h1 className="text-4xl md:text-6xl font-bold text-white animate-in zoom-in duration-700" style={{ fontFamily: 'cursive' }}>
                        Let's Cook!
                      </h1>
                      <p className="text-2xl text-white font-semibold">
                        {selectedRecipe.name}
                      </p>
                    </div>

                    <Card className="p-6 bg-white">
                      <div className="space-y-6">
                        {/* Full Ingredients */}
                        <div>
                          <h3 className="text-xl font-bold text-[hsl(var(--crumble-dark))] mb-3 flex items-center gap-2">
                            <ChefHat className="w-5 h-5" />
                            Ingredients
                          </h3>
                          <ul className="list-disc list-inside space-y-2 text-foreground/70">
                            {selectedRecipe.ingredients.map((ing, i) => (
                              <li key={i} className="ml-2">{ing}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Missing Ingredients */}
                        {selectedRecipe.missingIngredients && selectedRecipe.missingIngredients.length > 0 && (
                          <div className="bg-accent/10 p-4 rounded-lg border border-accent/20">
                            <h4 className="font-semibold mb-2 text-accent">
                              Missing Ingredients:
                            </h4>
                            <ul className="list-disc list-inside space-y-1 text-foreground/70 mb-3">
                              {selectedRecipe.missingIngredients.map((ing, i) => (
                                <li key={i} className="ml-2">{ing}</li>
                              ))}
                            </ul>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={() => toast.success("Opening UberEats...")}
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

                        {/* Instructions */}
                        <div>
                          <h3 className="text-xl font-bold text-[hsl(var(--crumble-dark))] mb-3">
                            Instructions
                          </h3>
                          <ol className="space-y-3">
                            {selectedRecipe.instructions.map((step, i) => (
                              <li key={i} className="flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
                                  {i + 1}
                                </span>
                                <span className="text-foreground/70 pt-0.5">{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    </Card>

                    <div className="space-y-3 mt-6 animate-in slide-in-from-bottom duration-700">
                      <Button 
                        size="lg"
                        className="w-full bg-white text-primary hover:bg-white/90 font-bold"
                        onClick={() => navigate("/home")}
                      >
                        Continue to Home
                      </Button>
                      <Button 
                        variant="outline"
                        size="lg"
                        className="w-full border-white text-white hover:bg-white/20 font-semibold"
                        onClick={handleKeepSwiping}
                      >
                        See More Recipes
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Recipe Swipe Cards */}
              {!showInstructions && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-[hsl(var(--crumble-dark))]">
                      Recipe Suggestions
                    </h2>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setRecipes([]);
                        setCurrentIndex(0);
                        setImageFile(null);
                        setImagePreview(null);
                        setIngredientText("");
                      }}
                    >
                      Start Over
                    </Button>
                  </div>

                  {recipes[currentIndex] && (
                    <>
                      <Card className="overflow-hidden shadow-2xl border-2 border-border">
                        {/* Hero Image */}
                        <div className="relative h-64">
                          <img
                            src={recipes[currentIndex].image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800"}
                            alt={recipes[currentIndex].name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-4 right-4">
                            <Badge className="bg-white/90 text-[hsl(var(--crumble-dark))] font-semibold">
                              {recipes[currentIndex].calories || "~500 cal"}
                            </Badge>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-4 bg-white">
                          <div>
                            <h3 className="text-2xl font-bold text-[hsl(var(--crumble-dark))] mb-2">
                              {recipes[currentIndex].name}
                            </h3>
                          </div>

                          {/* Info Row */}
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1 text-foreground/70">
                              <Clock className="w-4 h-4" />
                              {recipes[currentIndex].cookingTime || "30 min"}
                            </div>
                            <div className="flex items-center gap-1 text-foreground/70">
                              <Flame className="w-4 h-4" />
                              {recipes[currentIndex].calories || "~500 cal"}
                            </div>
                          </div>

                          {/* Key Ingredients */}
                          <div>
                            <h4 className="font-semibold mb-2 text-[hsl(var(--crumble-dark))]">
                              Key Ingredients:
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {recipes[currentIndex].ingredients.slice(0, 5).map((ing, i) => (
                                <Badge key={i} variant="secondary">
                                  {ing.split(',')[0]}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Missing Ingredients */}
                          {recipes[currentIndex].missingIngredients && recipes[currentIndex].missingIngredients!.length > 0 && (
                            <div className="bg-accent/10 p-4 rounded-lg border border-accent/20">
                              <h4 className="font-semibold mb-2 text-accent flex items-center gap-2">
                                <ShoppingCart className="w-4 h-4" />
                                Missing Ingredients:
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {recipes[currentIndex].missingIngredients!.map((ing, i) => (
                                  <Badge key={i} variant="outline" className="border-accent/40">
                                    {ing}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </Card>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-center gap-6">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-16 w-16 rounded-full border-2 hover:bg-destructive hover:text-white hover:border-destructive"
                          onClick={() => handleSwipe("left")}
                        >
                          <X className="w-7 h-7" />
                        </Button>

                        <Button
                          variant="dark"
                          size="icon"
                          className="h-20 w-20 rounded-full shadow-lg"
                          onClick={() => handleSwipe("right")}
                        >
                          <Check className="w-8 h-8" />
                        </Button>
                      </div>

                      {/* Counter */}
                      <p className="text-center text-sm text-foreground/60">
                        {currentIndex + 1} of {recipes.length}
                      </p>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CookAtHome;
