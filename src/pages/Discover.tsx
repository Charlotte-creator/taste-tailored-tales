import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Check, Star, Info, MapPin, Clock, DollarSign } from "lucide-react";
import { toast } from "sonner";
import BackButton from "@/components/BackButton";
import { supabase } from "@/integrations/supabase/client";

// Mock restaurant data
const mockRestaurants = [
  {
    id: 1,
    name: "Spicy Dragon Noodles",
    restaurant: "Dragon Bowl",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800",
    cuisine: "Asian Fusion",
    dietSafe: ["Gluten-free option"],
    price: "$$",
    eta: "15 min",
    distance: "0.8 mi",
    calories: "~650 cal",
    totalPrice: "$16.50",
    why: "Under 20 min, matches spicy preference",
  },
  {
    id: 2,
    name: "Classic Margherita",
    restaurant: "Bella Pizza",
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800",
    cuisine: "Italian",
    dietSafe: ["Vegetarian"],
    price: "$",
    eta: "12 min",
    distance: "0.5 mi",
    calories: "~580 cal",
    totalPrice: "$13.00",
    why: "Quick delivery, comfort food",
  },
  {
    id: 3,
    name: "Buddha Bowl",
    restaurant: "Green Life Cafe",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800",
    cuisine: "Healthy",
    dietSafe: ["Vegan", "Gluten-free"],
    price: "$$",
    eta: "18 min",
    distance: "1.2 mi",
    calories: "~420 cal",
    totalPrice: "$15.00",
    why: "Low calorie, matches dietary preferences",
  },
];

const Discover = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [likedRestaurant, setLikedRestaurant] = useState<typeof mockRestaurants[0] | null>(null);

  const currentRestaurant = mockRestaurants[currentIndex];

  const handleSwipe = async (direction: "left" | "right" | "up") => {
    if (direction === "right") {
      setLikedRestaurant(currentRestaurant);
      setShowCelebration(true);
      // Save to localStorage
      const liked = JSON.parse(localStorage.getItem("likedRestaurants") || "[]");
      liked.push({ ...currentRestaurant, likedAt: new Date().toISOString() });
      localStorage.setItem("likedRestaurants", JSON.stringify(liked));
      
      // Save to meal history
      const userId = '00000000-0000-0000-0000-000000000000'; // Fixed guest UUID (in production, use auth.uid())
      const priceNum = parseFloat(currentRestaurant.totalPrice.replace('$', ''));
      await supabase.from('meal_history').insert({
        user_id: userId,
        meal_type: 'dineout',
        meal_name: currentRestaurant.name,
        restaurant_name: currentRestaurant.restaurant,
        expense: priceNum
      });
      
      return; // Stop here when user likes the restaurant
    } else if (direction === "up") {
      toast.success(`${currentRestaurant.name} saved to favorites!`, {
        icon: "⭐",
      });
    }

    setTimeout(() => {
      if (currentIndex < mockRestaurants.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowDetails(false);
      } else {
        setCurrentIndex(0);
      }
    }, 300);
  };

  const handleKeepSwiping = () => {
    setShowCelebration(false);
    setTimeout(() => {
      if (currentIndex < mockRestaurants.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowDetails(false);
      } else {
        setCurrentIndex(0);
      }
    }, 300);
  };

  return (
    <div className="min-h-screen hexagon-pattern flex flex-col items-center justify-center p-4">
      <BackButton />
      {/* Celebration Overlay */}
      {showCelebration && likedRestaurant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary via-accent to-primary animate-in fade-in duration-500">
          <div className="text-center space-y-8 p-8 animate-in scale-in duration-500">
            <h1 className="text-6xl md:text-8xl font-bold text-white animate-in zoom-in duration-700" style={{ fontFamily: 'cursive' }}>
              Bon Appétit!
            </h1>
            
            <div className="flex justify-center gap-4 animate-in slide-in-from-bottom duration-700 delay-150">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl">
                <img 
                  src={likedRestaurant.image} 
                  alt={likedRestaurant.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="animate-in slide-in-from-bottom duration-700 delay-300">
              <p className="text-2xl text-white font-semibold mb-2">
                You matched with
              </p>
              <p className="text-3xl text-white font-bold">
                {likedRestaurant.name}
              </p>
              <p className="text-xl text-white/90 mt-1">
                at {likedRestaurant.restaurant}
              </p>
            </div>

            <div className="space-y-3 animate-in slide-in-from-bottom duration-700 delay-500">
              <Button 
                size="lg"
                className="w-full max-w-xs bg-white text-primary hover:bg-white/90 font-bold text-lg"
                onClick={() => toast.success("Opening delivery app...")}
              >
                ORDER NOW
              </Button>
              <Button 
                size="lg"
                className="w-full max-w-xs bg-white text-primary hover:bg-white/90 font-bold text-lg"
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
                className="w-full max-w-xs border-white text-white hover:bg-white/20 font-semibold"
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
          {currentIndex + 1} of {mockRestaurants.length}
        </p>
      </div>
    </div>
  );
};

export default Discover;
