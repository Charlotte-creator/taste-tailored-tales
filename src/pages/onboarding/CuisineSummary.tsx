import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Sparkles } from "lucide-react";
import BackButton from "@/components/BackButton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const CuisineSummary = () => {
  const [nutritionBalance, setNutritionBalance] = useState("");
  const [cuisineVariety, setCuisineVariety] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Get the AI-generated profile from localStorage
    const profile = localStorage.getItem("cuisineProfile");
    if (profile) {
      try {
        const parsed = JSON.parse(profile);
        setNutritionBalance(parsed.nutrition_balance || "");
        setCuisineVariety(parsed.cuisine_variety || "");
        setSuggestions(parsed.suggestions || "");
      } catch (error) {
        console.error("Error parsing profile:", error);
        // Set default values
        setNutritionBalance("We'll learn more about your nutrition preferences as you add food photos and interact with the app.");
        setCuisineVariety("Share some photos of your favorite foods to help us understand your cuisine preferences better.");
        setSuggestions("Start by uploading photos of meals you enjoy to get personalized recommendations tailored to your taste.");
      }
    } else {
      // Set default values if no profile exists
      setNutritionBalance("We'll learn more about your nutrition preferences as you add food photos and interact with the app.");
      setCuisineVariety("Share some photos of your favorite foods to help us understand your cuisine preferences better.");
      setSuggestions("Start by uploading photos of meals you enjoy to get personalized recommendations tailored to your taste.");
    }
  }, []);

  const handleConfirm = async () => {
    setIsSaving(true);
    try {
      // Only save to database if user is authenticated
      if (user) {
        const { error } = await supabase
          .from("profiles")
          .update({
            nutrition_balance: nutritionBalance,
            cuisine_variety: cuisineVariety,
            suggestions: suggestions,
            onboarding_completed: true
          })
          .eq("id", user.id);

        if (error) throw error;
        toast.success("Profile saved successfully!");
      }
      
      // Navigate to home regardless of auth status
      navigate("/home");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
      // Still navigate even if save fails
      navigate("/home");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen hexagon-pattern flex flex-col p-6">
      <BackButton />
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-between py-12 animate-in fade-in duration-500">
        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
          <div className="h-full bg-[hsl(var(--crumble-dark))] w-3/4 transition-all duration-300" />
        </div>

        {/* Content */}
        <div className="space-y-8 flex-1 flex flex-col justify-center">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
              <h1 className="text-4xl font-bold text-[hsl(var(--crumble-dark))]">
                Your taste profile
              </h1>
            </div>
            <p className="text-foreground/70">
              Here's what we learned about your preferences
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-[hsl(var(--crumble-dark))]">Nutrition Balance</h3>
              {isEditing ? (
                <Textarea
                  value={nutritionBalance}
                  onChange={(e) => setNutritionBalance(e.target.value)}
                  className="min-h-[80px] bg-white"
                />
              ) : (
                <div className="glass-card p-4 rounded-lg border border-primary/20">
                  <p className="text-[hsl(var(--crumble-dark))] leading-relaxed">{nutritionBalance}</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-[hsl(var(--crumble-dark))]">Cuisine Variety</h3>
              {isEditing ? (
                <Textarea
                  value={cuisineVariety}
                  onChange={(e) => setCuisineVariety(e.target.value)}
                  className="min-h-[80px] bg-white"
                />
              ) : (
                <div className="glass-card p-4 rounded-lg border border-primary/20">
                  <p className="text-[hsl(var(--crumble-dark))] leading-relaxed">{cuisineVariety}</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-[hsl(var(--crumble-dark))]">Suggestions</h3>
              {isEditing ? (
                <Textarea
                  value={suggestions}
                  onChange={(e) => setSuggestions(e.target.value)}
                  className="min-h-[80px] bg-white"
                />
              ) : (
                <div className="glass-card p-4 rounded-lg border border-primary/20">
                  <p className="text-[hsl(var(--crumble-dark))] leading-relaxed">{suggestions}</p>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
              className="w-full"
            >
              {isEditing ? "Done Editing" : "Edit Profile"}
            </Button>
          </div>

          <p className="text-sm text-center text-foreground/60">
            This helps us find the perfect recommendations for you
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-8 space-y-3">
          <Button
            variant="dark"
            size="lg"
            className="w-full"
            onClick={handleConfirm}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save & Continue"}
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CuisineSummary;
