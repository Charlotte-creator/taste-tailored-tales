import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Sparkles, Save, Plus, Image as ImageIcon, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface FoodItem {
  id: string;
  image?: string;
}

const Profile = () => {
  const [nutritionBalance, setNutritionBalance] = useState("");
  const [cuisineVariety, setCuisineVariety] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { user, initializing } = useAuth();

  useEffect(() => {
    loadProfile();
    loadFoodPhotos();
  }, [user]);

  // Check if user needs to complete onboarding
  useEffect(() => {
    const checkOnboarding = async () => {
      if (!initializing && user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", user.id)
          .single();

        if (!profile?.onboarding_completed) {
          navigate("/onboarding/name", { replace: true });
        }
      } else if (!initializing && !user) {
        navigate("/auth", { replace: true });
      }
    };

    checkOnboarding();
  }, [user, initializing, navigate]);

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

  const loadFoodPhotos = () => {
    const savedFoods = localStorage.getItem("userFoods");
    if (savedFoods) {
      try {
        const parsed = JSON.parse(savedFoods);
        setFoods(parsed);
      } catch (error) {
        console.error("Error loading food photos:", error);
      }
    }
  };

  const addFoodSlot = () => {
    if (foods.length < 6) {
      const newFood = { id: Date.now().toString() };
      setFoods([...foods, newFood]);
      setTimeout(() => {
        fileInputRef.current?.click();
      }, 100);
    }
  };

  const handleImageUpload = (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedFoods = foods.map(food => 
          food.id === id ? { ...food, image: reader.result as string } : food
        );
        setFoods(updatedFoods);
        localStorage.setItem("userFoods", JSON.stringify(updatedFoods));
        toast.success("Photo updated!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNewImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFoods(prev => {
          const lastIndex = prev.length - 1;
          if (lastIndex >= 0) {
            const updated = [...prev];
            updated[lastIndex] = { ...updated[lastIndex], image: reader.result as string };
            localStorage.setItem("userFoods", JSON.stringify(updated));
            return updated;
          }
          return prev;
        });
        toast.success("Photo added!");
      };
      reader.readAsDataURL(file);
    }
    event.target.value = '';
  };

  const handleRemovePhoto = (id: string) => {
    const updatedFoods = foods.filter(food => food.id !== id);
    setFoods(updatedFoods);
    localStorage.setItem("userFoods", JSON.stringify(updatedFoods));
    toast.success("Photo removed!");
  };

  const handleRegenerateProfile = async () => {
    if (foods.filter(f => f.image).length < 2) {
      toast.error("Please add at least 2 food photos to regenerate your profile");
      return;
    }

    setIsRegenerating(true);
    try {
      const foodImages = foods.filter(f => f.image).map(f => f.image);
      const allergiesStr = localStorage.getItem("userAllergies");
      const allergies = allergiesStr ? JSON.parse(allergiesStr) : [];

      const { data, error } = await supabase.functions.invoke("generate-taste-profile", {
        body: { foodImages, allergies }
      });

      if (error) throw error;

      if (data) {
        setNutritionBalance(data.nutrition_balance || "");
        setCuisineVariety(data.cuisine_variety || "");
        setSuggestions(data.suggestions || "");

        // Save to database
        await supabase
          .from("profiles")
          .update({
            nutrition_balance: data.nutrition_balance,
            cuisine_variety: data.cuisine_variety,
            suggestions: data.suggestions,
          })
          .eq("id", user!.id);

        localStorage.setItem("cuisineProfile", JSON.stringify(data));
        toast.success("Taste profile regenerated successfully!");
      }
    } catch (error) {
      console.error("Error regenerating profile:", error);
      toast.error("Failed to regenerate profile");
    } finally {
      setIsRegenerating(false);
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
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleNewImageUpload}
      />
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

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="profile">Taste Profile</TabsTrigger>
            <TabsTrigger value="photos">Favorite Foods</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
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
          </TabsContent>

          <TabsContent value="photos">
            <Card className="p-6 bg-white space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-[hsl(var(--crumble-dark))]">
                      Your Favorite Foods
                    </h3>
                    <p className="text-sm text-foreground/60 mt-1">
                      Update your food photos to refine your taste profile
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {foods.map((food) => (
                    <div key={food.id} className="relative group">
                      <Card className="aspect-square relative overflow-hidden border-2 border-border hover:border-primary transition-colors cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                          onChange={(e) => handleImageUpload(food.id, e)}
                        />
                        {food.image ? (
                          <img src={food.image} alt="Food" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-white">
                            <ImageIcon className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                      </Card>
                      {food.image && (
                        <button
                          onClick={() => handleRemovePhoto(food.id)}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  
                  {foods.length < 6 && (
                    <Card
                      onClick={addFoodSlot}
                      className="aspect-square flex items-center justify-center border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer bg-white"
                    >
                      <Plus className="w-8 h-8 text-muted-foreground" />
                    </Card>
                  )}
                </div>

                <p className="text-sm text-foreground/60">
                  Add at least 2 photos to regenerate your taste profile
                </p>
              </div>

              <div className="pt-4 border-t">
                <Button
                  variant="dark"
                  className="w-full"
                  onClick={handleRegenerateProfile}
                  disabled={isRegenerating || foods.filter(f => f.image).length < 2}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
                  {isRegenerating ? "Regenerating..." : "Regenerate Taste Profile"}
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
