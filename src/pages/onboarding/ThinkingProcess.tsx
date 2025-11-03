import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ThinkingProcess = () => {
  const [keywords, setKeywords] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const extractKeywords = (profileData: any, preferences: any): string[] => {
    const words: string[] = [];
    
    // Extract from cuisine variety
    if (profileData?.cuisine_variety) {
      const cuisineText = profileData.cuisine_variety.toLowerCase();
      if (cuisineText.includes("american")) words.push("American Cuisine");
      if (cuisineText.includes("italian")) words.push("Italian");
      if (cuisineText.includes("mexican")) words.push("Mexican");
      if (cuisineText.includes("burger")) words.push("Burgers");
      if (cuisineText.includes("salad")) words.push("Fresh Salads");
      if (cuisineText.includes("comfort")) words.push("Comfort Food");
    }

    // Extract from allergies
    if (preferences.allergies?.length > 0) {
      preferences.allergies.forEach((allergy: string) => {
        words.push(`${allergy}-Free`);
      });
    }

    // Extract from dining context
    if (preferences.diningContext) {
      words.push(`${preferences.diningContext.charAt(0).toUpperCase() + preferences.diningContext.slice(1)} Dining`);
    }

    // Extract from priority
    if (preferences.priority) {
      words.push(preferences.priority.charAt(0).toUpperCase() + preferences.priority.slice(1));
    }

    // Extract from constraints
    if (preferences.travelTime) {
      words.push(`${preferences.travelTime}min Travel`);
    }
    if (preferences.budget) {
      words.push(`$${preferences.budget} Budget`);
    }
    if (preferences.vegan) {
      words.push("Vegan");
    }

    return words;
  };

  useEffect(() => {
    analyzePreferences();
  }, []);

  const analyzePreferences = async () => {
    try {
      // First, generate the taste profile from food images
      const foodsData = localStorage.getItem("userFoods");
      console.log("Raw foods data from localStorage:", foodsData);
      
      const foods = foodsData ? JSON.parse(foodsData) : [];
      console.log("Parsed foods array:", foods);
      
      const allergies = JSON.parse(localStorage.getItem("userAllergies") || "[]");

      // Extract only the base64 image data from foods
      const foodImages = foods
        .filter((f: any) => f.image)
        .map((f: any) => f.image);

      console.log("Extracted food images count:", foodImages.length);
      console.log("First food item:", foods[0]);
      if (foodImages.length > 0) {
        console.log("Sample image data length:", foodImages[0]?.length);
        console.log("Sample image data start:", foodImages[0]?.substring(0, 50));
      }

      const { data: profileData, error: profileError } = await supabase.functions.invoke(
        "generate-taste-profile",
        { body: { foodImages, allergies } }
      );

      if (profileError) {
        console.error("Error generating profile:", profileError);
        throw profileError;
      }

      console.log("Received profile data:", profileData);

      // Save profile to localStorage for the next page
      if (profileData) {
        // Validate the profile data before saving
        if (profileData.nutrition_balance && profileData.cuisine_variety && profileData.suggestions) {
          localStorage.setItem("cuisineProfile", JSON.stringify(profileData));
          console.log("Profile saved to localStorage:", profileData);
        } else {
          console.error("Profile data incomplete:", profileData);
          throw new Error("Received incomplete profile data from AI");
        }
      } else {
        throw new Error("No profile data received");
      }

      // Gather all user preferences from localStorage
      const preferences = {
        allergies,
        diningContext: localStorage.getItem("diningContext") || "",
        priority: localStorage.getItem("priority") || "",
        ...JSON.parse(localStorage.getItem("constraints") || "{}"),
      };

      console.log("Analyzing preferences:", preferences);

      // Extract keywords from profile and preferences
      const extractedKeywords = extractKeywords(profileData, preferences);
      setKeywords(extractedKeywords);
    } catch (error) {
      console.error("Failed to analyze preferences:", error);
      toast.error("Failed to analyze your preferences. Proceeding with defaults.");
      // Fallback keywords
      setKeywords(["Comfort Food", "Casual Dining", "Budget-Friendly"]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    navigate("/discover");
  };

  return (
    <div className="min-h-screen hexagon-pattern flex flex-col p-6 pb-24">
      <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col justify-center py-12 animate-in fade-in duration-500">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent animate-pulse">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-[hsl(var(--crumble-dark))]">
              Analyzing Your Preferences
            </h1>
            <p className="text-foreground/70">
              Understanding your taste profile to find perfect matches...
            </p>
          </div>

          <Card className="p-8 bg-white border-2 border-primary/20">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="text-foreground/70">Thinking...</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-[hsl(var(--crumble-dark))]">
                    Here's what I understand
                  </h3>
                </div>
                
                <div className="flex flex-wrap gap-3 justify-center">
                  {keywords.map((keyword, i) => (
                    <div
                      key={i}
                      className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-[hsl(var(--crumble-dark))] font-medium animate-in fade-in"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      {keyword}
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t">
                  <Button
                    variant="dark"
                    size="lg"
                    className="w-full"
                    onClick={handleContinue}
                  >
                    Show Me Options
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {!isLoading && (
            <p className="text-sm text-center text-foreground/60 animate-in fade-in duration-700">
              These insights help us curate personalized recommendations just for you
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThinkingProcess;
