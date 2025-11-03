import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Check, Star, Info, MapPin, Clock, DollarSign, Loader2 } from "lucide-react";
import { toast } from "sonner";
import BackButton from "@/components/BackButton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Restaurant = {
  id: number;
  name: string;
  restaurant: string;
  image: string;
  cuisine: string;
  dietSafe: string[];
  price: string;
  eta: string;
  distance: string;
  calories: string;
  totalPrice: string;
  why: string;
};

const Discover = () => {
  const { user, initializing } = useAuth();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [likedRestaurant, setLikedRestaurant] = useState<Restaurant | null>(null);

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!initializing && !user) {
      navigate("/auth", { replace: true });
    }
  }, [user, initializing, navigate]);

  // Check if user needs to complete onboarding and load recommendations
  useEffect(() => {
    const checkOnboarding = async () => {
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", user.id)
          .single();

        if (!profile?.onboarding_completed) {
          navigate("/onboarding/name", { replace: true });
          return;
        }
      }
      
      // Load recommendations after onboarding check
      await loadRecommendations();
    };

    checkOnboarding();
  }, [user, navigate]);

  const loadRecommendations = async () => {
    setIsLoading(true);
    try {
      // Get user preferences from localStorage and profile
      const cuisineProfile = localStorage.getItem("cuisineProfile");
      const allergies = JSON.parse(localStorage.getItem("userAllergies") || "[]");
      const diningContext = localStorage.getItem("diningContext") || "casual";
      const priority = localStorage.getItem("priority") || "comfort";
      const constraints = JSON.parse(localStorage.getItem("constraints") || "{}");

      let cuisineVariety = "";
      if (cuisineProfile) {
        try {
          const parsed = JSON.parse(cuisineProfile);
          cuisineVariety = parsed.cuisine_variety || "";
        } catch (e) {
          console.error("Error parsing cuisine profile:", e);
        }
      }

      const preferences = {
        cuisineVariety,
        allergies,
        diningContext,
        priority,
        budget: constraints.budget || 50,
        travelTime: constraints.travelTime || 30,
        vegan: constraints.vegan || false,
        constraints
      };

      console.log("Loading recommendations with preferences:", preferences);

      const { data, error } = await supabase.functions.invoke("generate-recommendations", {
        body: { preferences, count: 10 }
      });

      if (error) throw error;

      if (data?.recommendations && data.recommendations.length > 0) {
        setRestaurants(data.recommendations);
        console.log("Loaded recommendations:", data.recommendations);
      } else {
        toast.error("No recommendations found. Using sample data.");
        setRestaurants([]);
      }
    } catch (error) {
      console.error("Failed to load recommendations:", error);
      toast.error("Failed to load recommendations. Please try again.");
      setRestaurants([]);
    } finally {
      setIsLoading(false);
    }
  };

  const currentRestaurant = restaurants[currentIndex];

  const handleSwipe = async (direction: "left" | "right" | "up") => {
    if (direction === "right") {
      setLikedRestaurant(currentRestaurant);
      setShowCelebration(true);
      
      // Save to localStorage (check for duplicates)
      const liked = JSON.parse(localStorage.getItem("likedRestaurants") || "[]");
      const isDuplicate = liked.some((item: any) => 
        item.id === currentRestaurant.id || 
        (item.name === currentRestaurant.name && item.restaurant === currentRestaurant.restaurant)
      );
      
      if (!isDuplicate) {
        liked.push({ ...currentRestaurant, likedAt: new Date().toISOString() });
        localStorage.setItem("likedRestaurants", JSON.stringify(liked));
      }
      
      // Save to meal history (auth or local)
      try {
        const priceNum = parseFloat(currentRestaurant.totalPrice.replace('$', ''));
        const mealEntry = {
          meal_type: 'dineout',
          meal_name: currentRestaurant.name,
          restaurant_name: currentRestaurant.restaurant,
          expense: priceNum,
          created_at: new Date().toISOString()
        };

        if (user?.id) {
          await supabase.from('meal_history').insert({
            user_id: user.id,
            ...mealEntry
          });
        } else {
          // Guest: save to localStorage
          const localHistory = JSON.parse(localStorage.getItem('mealHistory') || '[]');
          localHistory.push(mealEntry);
          localStorage.setItem('mealHistory', JSON.stringify(localHistory));
        }
      } catch (e) {
        console.warn('Non-fatal: failed to record dineout history', e);
      }
      
      return; // Stop here when user likes the restaurant
    } else if (direction === "up") {
      toast.success(`${currentRestaurant.name} saved to favorites!`, {
        icon: "⭐",
      });
    }

    setTimeout(() => {
      if (currentIndex < restaurants.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowDetails(false);
      } else {
        // Reload recommendations when we reach the end
        loadRecommendations();
        setCurrentIndex(0);
      }
    }, 300);
  };

  const handleKeepSwiping = () => {
    setShowCelebration(false);
    setTimeout(() => {
      if (currentIndex < restaurants.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowDetails(false);
      } else {
        // Reload recommendations when we reach the end
        loadRecommendations();
        setCurrentIndex(0);
      }
    }, 300);
  };

  // Show loading state
  if (isLoading || !currentRestaurant) {
    return (
      <div className="min-h-screen hexagon-pattern flex flex-col items-center justify-center p-4">
        <BackButton />
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-foreground/70">Finding perfect meals for you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen hexagon-pattern flex flex-col items-center justify-center p-4">
      <BackButton />
      {/* Celebration Overlay */}
      {showCelebration && likedRestaurant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background animate-in fade-in duration-500">
          <div className="text-center space-y-8 p-8 max-w-lg animate-in scale-in duration-500">
            <h1 className="text-6xl md:text-7xl font-bold text-[hsl(var(--crumble-dark))] animate-in zoom-in duration-700" style={{ fontFamily: 'Georgia, serif' }}>
              Bon Appétit!
            </h1>
            
            <div className="flex justify-center animate-in slide-in-from-bottom duration-700 delay-150">
              <div className="w-40 h-40 rounded-full overflow-hidden border-8 border-white shadow-2xl ring-4 ring-primary/20">
                <img 
                  src={likedRestaurant.image} 
                  alt={likedRestaurant.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="animate-in slide-in-from-bottom duration-700 delay-300">
              <p className="text-lg text-foreground/70 mb-3">
                You matched with
              </p>
              <p className="text-3xl md:text-4xl text-[hsl(var(--crumble-dark))] font-bold mb-2">
                {likedRestaurant.name}
              </p>
              <p className="text-xl text-foreground/80">
                at {likedRestaurant.restaurant}
              </p>
            </div>

            <div className="space-y-3 animate-in slide-in-from-bottom duration-700 delay-500">
              <Button 
                size="lg"
                variant="dark"
                className="w-full max-w-sm font-bold text-lg shadow-lg hover:scale-105 transition-transform"
                onClick={() => toast.success("Opening delivery app...")}
              >
                ORDER NOW
              </Button>
              <Button 
                size="lg"
                variant="dark"
                className="w-full max-w-sm font-bold text-lg shadow-lg hover:scale-105 transition-transform"
                onClick={() => {
                  const address = encodeURIComponent(likedRestaurant.restaurant);
                  window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
                }}
              >
                GET DIRECTIONS
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="w-full max-w-sm border-2 border-[hsl(var(--crumble-dark))] text-[hsl(var(--crumble-dark))] hover:bg-[hsl(var(--crumble-dark))] hover:text-white font-semibold hover:scale-105 transition-all"
                onClick={handleKeepSwiping}
              >
                KEEP SWIPING
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md animate-in fade-in duration-500">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-[hsl(var(--crumble-dark))] mb-2">
            Discover Food
          </h1>
          <p className="text-foreground/70">
            Swipe to find your next meal
          </p>
        </div>

        {/* Food Card */}
        <Card className="overflow-hidden shadow-2xl border-2 border-border mb-6">
          {/* Image */}
          <div className="relative h-80">
            <img
              src={currentRestaurant.image}
              alt={currentRestaurant.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <Badge className="bg-white/90 text-[hsl(var(--crumble-dark))] font-semibold">
                {currentRestaurant.price}
              </Badge>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4 bg-white">
            <div>
              <h2 className="text-2xl font-bold text-[hsl(var(--crumble-dark))] mb-1">
                {currentRestaurant.name}
              </h2>
              <p className="text-muted-foreground">{currentRestaurant.restaurant}</p>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{currentRestaurant.cuisine}</Badge>
              {currentRestaurant.dietSafe.map((diet) => (
                <Badge key={diet} variant="outline">
                  {diet}
                </Badge>
              ))}
            </div>

            {/* Info Row */}
            <div className="flex items-center gap-4 text-sm text-foreground/70">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {currentRestaurant.eta}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {currentRestaurant.distance}
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                {currentRestaurant.totalPrice}
              </div>
            </div>

            {/* Why This */}
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm font-medium text-[hsl(var(--crumble-dark))]">
                ✨ {currentRestaurant.why}
              </p>
            </div>

            {/* Details Section (Expandable) */}
            {showDetails && (
              <div className="space-y-2 pt-4 border-t animate-in slide-in-from-top duration-200">
                <p className="text-sm">
                  <span className="font-semibold">Estimated calories:</span>{" "}
                  {currentRestaurant.calories}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">Total with fees:</span>{" "}
                  {currentRestaurant.totalPrice}
                </p>
                <Button variant="outline" size="sm" className="w-full mt-2">
                  View Full Menu
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="h-14 w-14 rounded-full border-2 hover:bg-destructive hover:text-white hover:border-destructive"
            onClick={() => handleSwipe("left")}
          >
            <X className="w-6 h-6" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full border-2 hover:bg-primary hover:text-white hover:border-primary"
            onClick={() => setShowDetails(!showDetails)}
          >
            <Info className="w-5 h-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-14 w-14 rounded-full border-2 hover:bg-accent hover:text-white hover:border-accent"
            onClick={() => handleSwipe("up")}
          >
            <Star className="w-6 h-6" />
          </Button>

          <Button
            variant="dark"
            size="icon"
            className="h-16 w-16 rounded-full"
            onClick={() => handleSwipe("right")}
          >
            <Check className="w-7 h-7" />
          </Button>
        </div>

        {/* Counter */}
        <p className="text-center mt-6 text-sm text-foreground/60">
          {currentIndex + 1} of {restaurants.length}
        </p>
      </div>
    </div>
  );
};

export default Discover;
