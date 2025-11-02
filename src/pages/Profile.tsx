import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Sparkles, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const Profile = () => {
  const [nutritionBalance, setNutritionBalance] = useState("");
  const [cuisineVariety, setCuisineVariety] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("nutrition_balance, cuisine_variety, suggestions")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        setNutritionBalance(data.nutrition_balance || "");
        setCuisineVariety(data.cuisine_variety || "");
        setSuggestions(data.suggestions || "");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          nutrition_balance: nutritionBalance,
          cuisine_variety: cuisineVariety,
          suggestions: suggestions,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen hexagon-pattern flex items-center justify-center">
        <p className="text-foreground/70">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen hexagon-pattern flex flex-col p-6">
      <div className="w-full max-w-2xl mx-auto py-8 animate-in fade-in duration-500">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/home")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-[hsl(var(--crumble-dark))] flex items-center gap-2">
              <Sparkles className="w-7 h-7 text-primary" />
              Your Taste Profile
            </h1>
            <p className="text-foreground/70 mt-1">
              View and edit your personalized food preferences
            </p>
          </div>
        </div>

        <Card className="p-6 bg-white space-y-6">
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[hsl(var(--crumble-dark))]">
                  Nutrition Balance
                </h3>
              </div>
              {isEditing ? (
                <Textarea
                  value={nutritionBalance}
                  onChange={(e) => setNutritionBalance(e.target.value)}
                  className="min-h-[100px]"
                  placeholder="Your nutrition balance insights..."
                />
              ) : (
                <div className="p-4 rounded-lg bg-background/50 border border-primary/10">
                  <p className="text-foreground/80 leading-relaxed">
                    {nutritionBalance || "No nutrition insights yet"}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-[hsl(var(--crumble-dark))]">
                Cuisine Variety
              </h3>
              {isEditing ? (
                <Textarea
                  value={cuisineVariety}
                  onChange={(e) => setCuisineVariety(e.target.value)}
                  className="min-h-[100px]"
                  placeholder="Your cuisine preferences..."
                />
              ) : (
                <div className="p-4 rounded-lg bg-background/50 border border-primary/10">
                  <p className="text-foreground/80 leading-relaxed">
                    {cuisineVariety || "No cuisine variety insights yet"}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-[hsl(var(--crumble-dark))]">
                Personalized Suggestions
              </h3>
              {isEditing ? (
                <Textarea
                  value={suggestions}
                  onChange={(e) => setSuggestions(e.target.value)}
                  className="min-h-[100px]"
                  placeholder="Suggestions for your diet..."
                />
              ) : (
                <div className="p-4 rounded-lg bg-background/50 border border-primary/10">
                  <p className="text-foreground/80 leading-relaxed">
                    {suggestions || "No suggestions yet"}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsEditing(false);
                    loadProfile();
                  }}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  variant="dark"
                  className="flex-1"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <Button
                variant="dark"
                className="w-full"
                onClick={() => setIsEditing(true)}
              >
                Edit Profile
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
