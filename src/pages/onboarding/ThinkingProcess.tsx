import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ThinkingProcess = () => {
  const [analysis, setAnalysis] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    analyzePreferences();
  }, []);

  const analyzePreferences = async () => {
    try {
      // First, generate the taste profile from food images
      const foods = JSON.parse(localStorage.getItem("userFoods") || "[]");
      const allergies = JSON.parse(localStorage.getItem("userAllergies") || "[]");

      // Extract only the base64 image data from foods
      const foodImages = foods
        .filter((f: any) => f.image)
        .map((f: any) => f.image);

      console.log("Generating taste profile from", foodImages.length, "food images");
      console.log("Sample image data:", foodImages[0]?.substring(0, 50));

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

      const { data, error } = await supabase.functions.invoke("analyze-preferences", {
        body: { preferences },
      });

      if (error) {
        console.error("Error analyzing preferences:", error);
        throw error;
      }

      if (data?.analysis) {
        setAnalysis(data.analysis);
      } else {
        throw new Error("No analysis returned");
      }
    } catch (error) {
      console.error("Failed to analyze preferences:", error);
      toast.error("Failed to analyze your preferences. Proceeding with defaults.");
      // Fallback analysis
      setAnalysis("Based on your preferences, we'll find the perfect dining options for you. Let's discover some amazing meals!");
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
                
                <div className="space-y-3">
                  {analysis.split('\n').filter(line => line.trim()).map((line, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-primary text-lg flex-shrink-0">•</span>
                      <p className="text-foreground/80 leading-relaxed">
                        {line.replace(/^[•\-\*]\s*/, '')}
                      </p>
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
