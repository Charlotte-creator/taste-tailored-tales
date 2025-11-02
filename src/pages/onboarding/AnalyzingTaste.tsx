import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Sparkles, Camera, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const AnalyzingTaste = () => {
  const [status, setStatus] = useState("Analyzing your food preferences...");
  const [isComplete, setIsComplete] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    analyzePreferences();
  }, []);

  const analyzePreferences = async () => {
    try {
      // Get data from localStorage
      const foods = JSON.parse(localStorage.getItem("userFoods") || "[]");
      const allergies = JSON.parse(localStorage.getItem("userAllergies") || "[]");

      console.log("Analyzing food preferences:", { foodCount: foods.length, allergies });

      // Extract only the base64 image data from foods
      const foodImages = foods
        .filter((f: any) => f.image)
        .map((f: any) => f.image);

      console.log("Extracted food images:", foodImages.length);

      // Simulated stages
      setStatus("Analyzing your food preferences...");
      await new Promise(resolve => setTimeout(resolve, 1000));

      setStatus("Identifying flavor patterns...");
      await new Promise(resolve => setTimeout(resolve, 1000));

      setStatus("Checking dietary restrictions...");
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Call the edge function to generate taste profile
      const { data, error } = await supabase.functions.invoke("generate-taste-profile", {
        body: { foodImages, allergies },
      });

      if (error) {
        console.error("Error generating taste profile:", error);
        throw error;
      }

      console.log("Received taste profile data:", data);

      // The edge function returns nutrition_balance, cuisine_variety, and suggestions
      if (data && (data.nutrition_balance || data.cuisine_variety || data.suggestions)) {
        // Save the full profile to localStorage
        localStorage.setItem("cuisineProfile", JSON.stringify(data));
        setStatus("Profile complete!");
        setIsComplete(true);
        
        // Navigate after a short delay
        setTimeout(() => {
          navigate("/onboarding/cuisine-summary");
        }, 1000);
      } else {
        throw new Error("No profile data returned");
      }
    } catch (error) {
      console.error("Failed to analyze preferences:", error);
      // Fallback summary
      const allergies = JSON.parse(localStorage.getItem("userAllergies") || "[]");
      const fallbackSummary = `You enjoy diverse, flavorful dishes with a preference for comfort foods and trying new cuisines${allergies.length > 0 ? `, while avoiding ${allergies.join(", ")}` : ""}.`;
      localStorage.setItem("cuisineSummary", fallbackSummary);
      setStatus("Profile complete!");
      setIsComplete(true);
      
      setTimeout(() => {
        navigate("/onboarding/cuisine-summary");
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen hexagon-pattern flex flex-col p-6 pb-24">
      <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col justify-center py-12 animate-in fade-in duration-500">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent animate-pulse">
              {isComplete ? (
                <Sparkles className="w-8 h-8 text-white" />
              ) : (
                <Camera className="w-8 h-8 text-white" />
              )}
            </div>
            <h1 className="text-4xl font-bold text-[hsl(var(--crumble-dark))]">
              Creating Your Taste Profile
            </h1>
            <p className="text-foreground/70">
              Analyzing your food preferences and dietary needs
            </p>
          </div>

          <Card className="p-8 bg-white border-2 border-primary/20">
            <div className="flex flex-col items-center justify-center space-y-6">
              {!isComplete ? (
                <>
                  <Loader2 className="w-12 h-12 animate-spin text-primary" />
                  <p className="text-lg text-[hsl(var(--crumble-dark))] font-medium text-center">
                    {status}
                  </p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-lg text-[hsl(var(--crumble-dark))] font-medium text-center">
                    {status}
                  </p>
                </>
              )}
            </div>
          </Card>

          <div className="space-y-3 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-foreground/60">
              <Camera className="w-4 h-4" />
              <span>Processing food images</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-foreground/60">
              <AlertCircle className="w-4 h-4" />
              <span>Checking allergies and restrictions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyzingTaste;
