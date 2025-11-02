import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { UtensilsCrossed, User, Users, Sparkles, MapPin, Heart, MessageCircle, ChefHat, Store, DollarSign, TrendingUp, LogOut } from "lucide-react";
import BackButton from "@/components/BackButton";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth, signOut } from "@/hooks/useAuth";

type Tab = "meal" | "profile" | "community";

// Mock community posts
const communityPosts = [
  {
    id: 1,
    user: "Sarah Chen",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    image: "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?w=800",
    dish: "Homemade Ramen",
    likes: 124,
    comments: 23,
    caption: "Finally nailed my ramen recipe! The broth took 8 hours but so worth it 🍜",
    timeAgo: "2 hours ago"
  },
  {
    id: 2,
    user: "Mike Rodriguez",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800",
    dish: "Pancake Stack",
    likes: 89,
    comments: 15,
    caption: "Sunday morning vibes ☀️ Fluffy pancakes with fresh berries and maple syrup",
    timeAgo: "5 hours ago"
  },
  {
    id: 3,
    user: "Emma Taylor",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800",
    dish: "Homemade Pizza",
    likes: 156,
    comments: 31,
    caption: "Wood-fired pizza night! Made the dough from scratch 🍕",
    timeAgo: "1 day ago"
  }
];

const Home = () => {
  const { user, initializing } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("meal");
  const [likedRestaurants, setLikedRestaurants] = useState<any[]>([]);
  const [likedRecipes, setLikedRecipes] = useState<any[]>([]);
  const [mealHistory, setMealHistory] = useState<any[]>([]);
  const [cookedRecipeId, setCookedRecipeId] = useState<string | null>(null);
  const [visitedRestaurantId, setVisitedRestaurantId] = useState<number | null>(null);
  const [expenseInputs, setExpenseInputs] = useState<Record<string, string>>({});
  const [showAllRecipes, setShowAllRecipes] = useState(false);
  const [showAllRestaurants, setShowAllRestaurants] = useState(false);
  const [userName, setUserName] = useState("");
  const [stats, setStats] = useState({
    homecookCount: 0,
    dineoutCount: 0,
    totalExpense: 0,
    homecookExpense: 0,
    dineoutExpense: 0
  });
  const navigate = useNavigate();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!initializing && !user) {
      navigate("/auth", { replace: true });
    }
  }, [user, initializing, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      // Get user name from profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name")
        .eq("id", user.id)
        .maybeSingle();
      
      const name = profile?.first_name || localStorage.getItem("userName") || "";
      setUserName(name);
      
      // Clean up duplicate restaurants in localStorage
      const liked = JSON.parse(localStorage.getItem("likedRestaurants") || "[]");
      const uniqueRestaurants = liked.filter((restaurant: any, index: number, self: any[]) => 
        index === self.findIndex((r: any) => 
          r.id === restaurant.id || 
          (r.name === restaurant.name && r.restaurant === restaurant.restaurant)
        )
      );
      if (uniqueRestaurants.length !== liked.length) {
        localStorage.setItem("likedRestaurants", JSON.stringify(uniqueRestaurants));
      }
      setLikedRestaurants(uniqueRestaurants);

      // Load from backend (user is already authenticated)
      if (user?.id) {
        // Fetch liked recipes
        const { data: recipes } = await supabase
          .from('liked_recipes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        setLikedRecipes(recipes || []);

        // Fetch meal history
        const { data: history } = await supabase
          .from('meal_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        setMealHistory(history || []);

        // Calculate stats
        if (history) {
          const homecook = history.filter(m => m.meal_type === 'homecook');
          const dineout = history.filter(m => m.meal_type === 'dineout');
          const totalExpense = history.reduce((sum, m) => sum + (parseFloat(String(m.expense || 0))), 0);
          const homecookExpense = homecook.reduce((sum, m) => sum + (parseFloat(String(m.expense || 0))), 0);
          const dineoutExpense = dineout.reduce((sum, m) => sum + (parseFloat(String(m.expense || 0))), 0);

          setStats({
            homecookCount: homecook.length,
            dineoutCount: dineout.length,
            totalExpense,
            homecookExpense,
            dineoutExpense
          });
        }
      }
    };

    fetchData();
  }, [activeTab, user]);

  const handleStartDiscovery = () => {
    navigate("/onboarding/context");
  };

  const handleMarkAsCooked = async (recipeId: string) => {
    const expense = expenseInputs[recipeId];
    if (!expense || parseFloat(expense) <= 0) {
      toast.error("Please enter a valid expense amount");
      return;
    }

    try {
      const recipe = likedRecipes.find(r => r.id === recipeId);
      const mealEntry = {
        meal_type: 'homecook',
        meal_name: recipe?.recipe_name,
        expense: parseFloat(expense),
        created_at: new Date().toISOString()
      };

      if (!user?.id) return;
      
      // Save to backend
      await supabase.from('meal_history').insert({
        user_id: user.id,
        ...mealEntry
      });

      toast.success("Meal tracked successfully!");
      setCookedRecipeId(null);
      setExpenseInputs(prev => {
        const copy = { ...prev };
        delete copy[recipeId];
        return copy;
      });
      
      // Refresh data
      const { data } = await supabase
        .from('meal_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      const history = data || [];
      setMealHistory(history);

      // Recalculate stats
      if (history.length > 0) {
        const homecook = history.filter(m => m.meal_type === 'homecook');
        const dineout = history.filter(m => m.meal_type === 'dineout');
        const totalExpense = history.reduce((sum, m) => sum + (parseFloat(String(m.expense || 0))), 0);
        const homecookExpense = homecook.reduce((sum, m) => sum + (parseFloat(String(m.expense || 0))), 0);
        const dineoutExpense = dineout.reduce((sum, m) => sum + (parseFloat(String(m.expense || 0))), 0);

        setStats({
          homecookCount: homecook.length,
          dineoutCount: dineout.length,
          totalExpense,
          homecookExpense,
          dineoutExpense
        });
      }
    } catch (error) {
      console.error("Error tracking meal:", error);
      toast.error("Failed to track meal");
    }
  };

  const handleMarkAsVisited = async (restaurantId: number) => {
    const expense = expenseInputs[`restaurant-${restaurantId}`];
    if (!expense || parseFloat(expense) <= 0) {
      toast.error("Please enter a valid expense amount");
      return;
    }

    try {
      const restaurant = likedRestaurants.find((r, idx) => idx === restaurantId);
      const mealEntry = {
        meal_type: 'dineout',
        meal_name: restaurant?.name,
        restaurant_name: restaurant?.restaurant,
        expense: parseFloat(expense),
        created_at: new Date().toISOString()
      };

      if (!user?.id) return;
      
      await supabase.from('meal_history').insert({
        user_id: user.id,
        ...mealEntry
      });

      toast.success("Restaurant visit tracked!");
      setVisitedRestaurantId(null);
      setExpenseInputs(prev => {
        const copy = { ...prev };
        delete copy[`restaurant-${restaurantId}`];
        return copy;
      });
      
      // Refresh data
      const { data } = await supabase
        .from('meal_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      const history = data || [];
      setMealHistory(history);

      // Recalculate stats
      if (history.length > 0) {
        const homecook = history.filter(m => m.meal_type === 'homecook');
        const dineout = history.filter(m => m.meal_type === 'dineout');
        const totalExpense = history.reduce((sum, m) => sum + (parseFloat(String(m.expense || 0))), 0);
        const homecookExpense = homecook.reduce((sum, m) => sum + (parseFloat(String(m.expense || 0))), 0);
        const dineoutExpense = dineout.reduce((sum, m) => sum + (parseFloat(String(m.expense || 0))), 0);

        setStats({
          homecookCount: homecook.length,
          dineoutCount: dineout.length,
          totalExpense,
          homecookExpense,
          dineoutExpense
        });
      }
    } catch (error) {
      console.error("Error tracking restaurant visit:", error);
      toast.error("Failed to track visit");
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/auth", { replace: true });
  };

  if (initializing) {
    return (
      <div className="min-h-screen hexagon-pattern flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground/70">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen hexagon-pattern flex flex-col">
      <BackButton />
      {/* Header */}
      <header className="bg-white border-b border-border p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-[hsl(var(--crumble-dark))]">
            Crumble
          </h1>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-6 pb-24">
        {activeTab === "meal" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold text-[hsl(var(--crumble-dark))]">
                What's on your mind?
              </h2>
              <p className="text-foreground/70">
                Let's find the perfect meal for you today
              </p>
            </div>

            <Card className="p-8 bg-gradient-to-br from-primary/10 to-accent/10 border-2 border-primary/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-[hsl(var(--crumble-dark))] mb-2">
                      Discover your next favorite
                    </h3>
                    <p className="text-foreground/70">
                      Based on your preferences, we'll help you find the perfect meal
                    </p>
                  </div>
                  <Button
                    variant="dark"
                    size="lg"
                    onClick={handleStartDiscovery}
                  >
                    Start Discovering
                  </Button>
                </div>
              </div>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">{likedRecipes.length + likedRestaurants.length}</p>
                <p className="text-sm text-foreground/70">Favorites</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">{stats.homecookCount + stats.dineoutCount}</p>
                <p className="text-sm text-foreground/70">Tried</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">{mealHistory.length}</p>
                <p className="text-sm text-foreground/70">History</p>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* User Header */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {userName ? userName[0].toUpperCase() : "U"}
                </span>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-[hsl(var(--crumble-dark))]">
                  {userName ? `${userName}'s Dashboard` : "Your Dashboard"}
                </h2>
                <p className="text-foreground/70">Welcome back!</p>
              </div>
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Homecook vs Dine Out Percentage */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-[hsl(var(--crumble-dark))]">
                  Meal Distribution
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <ChefHat className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">Home Cook</span>
                      </div>
                      <span className="text-sm font-bold">
                        {stats.homecookCount + stats.dineoutCount > 0
                          ? Math.round((stats.homecookCount / (stats.homecookCount + stats.dineoutCount)) * 100)
                          : 0}%
                      </span>
                    </div>
                    <Progress 
                      value={stats.homecookCount + stats.dineoutCount > 0
                        ? (stats.homecookCount / (stats.homecookCount + stats.dineoutCount)) * 100
                        : 0} 
                      className="h-2"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-accent" />
                        <span className="text-sm font-medium">Dine Out</span>
                      </div>
                      <span className="text-sm font-bold">
                        {stats.homecookCount + stats.dineoutCount > 0
                          ? Math.round((stats.dineoutCount / (stats.homecookCount + stats.dineoutCount)) * 100)
                          : 0}%
                      </span>
                    </div>
                    <Progress 
                      value={stats.homecookCount + stats.dineoutCount > 0
                        ? (stats.dineoutCount / (stats.homecookCount + stats.dineoutCount)) * 100
                        : 0} 
                      className="h-2 [&>div]:bg-accent"
                    />
                  </div>
                </div>
              </Card>

              {/* Expense Tracking */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-[hsl(var(--crumble-dark))]">
                  Expense Tracking
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground/70">Total Spent</span>
                    <span className="text-2xl font-bold text-[hsl(var(--crumble-dark))]">
                      ${stats.totalExpense.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <ChefHat className="w-4 h-4 text-primary" />
                      <span className="text-sm">Home Cook</span>
                    </div>
                    <span className="font-semibold">${stats.homecookExpense.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-accent" />
                      <span className="text-sm">Dine Out</span>
                    </div>
                    <span className="font-semibold">${stats.dineoutExpense.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-foreground/60 pt-2">
                    <TrendingUp className="w-3 h-3" />
                    <span>Track your spending habits</span>
                  </div>
                </div>
              </Card>
            </div>

            {/* Meal History by Date */}
            {mealHistory.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4 text-[hsl(var(--crumble-dark))]">
                  Meal History
                </h3>
                <div className="space-y-4">
                  {(() => {
                    // Group meals by date
                    const groupedByDate: Record<string, any[]> = {};
                    mealHistory.forEach((meal) => {
                      const date = new Date(meal.created_at).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      });
                      if (!groupedByDate[date]) {
                        groupedByDate[date] = [];
                      }
                      groupedByDate[date].push(meal);
                    });

                    return Object.entries(groupedByDate).map(([date, meals]) => (
                      <div key={date}>
                        <h4 className="text-lg font-semibold mb-3 text-[hsl(var(--crumble-dark))]">
                          {date}
                        </h4>
                        <div className="grid gap-3 ml-4">
                          {meals.map((meal, idx) => (
                            <Card key={idx} className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  {meal.meal_type === 'homecook' ? (
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                      <ChefHat className="w-5 h-5 text-primary" />
                                    </div>
                                  ) : (
                                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                                      <Store className="w-5 h-5 text-accent" />
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-semibold text-[hsl(var(--crumble-dark))]">
                                      {meal.meal_name}
                                    </p>
                                    {meal.restaurant_name && (
                                      <p className="text-sm text-foreground/70">
                                        at {meal.restaurant_name}
                                      </p>
                                    )}
                                    <p className="text-xs text-foreground/60">
                                      {new Date(meal.created_at).toLocaleTimeString('en-US', {
                                        hour: 'numeric',
                                        minute: '2-digit'
                                      })}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <Badge variant={meal.meal_type === 'homecook' ? 'default' : 'secondary'}>
                                    {meal.meal_type === 'homecook' ? 'Home Cook' : 'Dine Out'}
                                  </Badge>
                                  {meal.expense && (
                                    <p className="text-sm font-semibold mt-1 text-[hsl(var(--crumble-dark))]">
                                      ${parseFloat(String(meal.expense)).toFixed(2)}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}

            {/* Liked Recipes */}
            {likedRecipes.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-[hsl(var(--crumble-dark))]">
                    Liked Recipes
                  </h3>
                  {likedRecipes.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllRecipes(!showAllRecipes)}
                    >
                      {showAllRecipes ? 'Show Less' : `Show All (${likedRecipes.length})`}
                    </Button>
                  )}
                </div>
                <div className="relative">
                  <div className="grid gap-4">
                    {likedRecipes.slice(0, showAllRecipes ? likedRecipes.length : 2).map((recipe, index) => {
                    // Use a variety of food images
                    const foodImages = [
                      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop", // salad bowl
                      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop", // pizza
                      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=300&fit=crop", // pasta
                      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop", // pancakes
                      "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&h=300&fit=crop", // chicken dish
                      "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop", // soup
                    ];
                    const recipeImage = foodImages[index % foodImages.length];
                    
                    return (
                      <Card key={recipe.id || index} className="overflow-hidden">
                        <div className="relative h-32">
                          <img
                            src={recipeImage}
                            alt={recipe.recipe_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop";
                            }}
                          />
                        </div>
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="text-lg font-bold text-[hsl(var(--crumble-dark))]">
                              {recipe.recipe_name}
                            </h4>
                            <Heart className="w-5 h-5 text-red-500 fill-current" />
                          </div>
                          <div className="space-y-3">
                            <p className="text-sm text-foreground/70">
                              <span className="font-semibold">{recipe.ingredients.length}</span> ingredients
                            </p>
                            {recipe.missing_ingredients && recipe.missing_ingredients.length > 0 && (
                              <Badge variant="outline" className="text-xs">
                                {recipe.missing_ingredients.length} missing
                              </Badge>
                            )}
                            
                            {cookedRecipeId === recipe.id ? (
                              <div className="flex gap-2">
                                <input
                                  type="number"
                                  placeholder="Cost ($)"
                                  value={expenseInputs[recipe.id] || ""}
                                  onChange={(e) => setExpenseInputs(prev => ({
                                    ...prev,
                                    [recipe.id]: e.target.value
                                  }))}
                                  className="flex-1 px-3 py-2 text-sm border rounded-md"
                                  step="0.01"
                                  min="0"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleMarkAsCooked(recipe.id)}
                                >
                                  Save
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setCookedRecipeId(null);
                                    setExpenseInputs(prev => {
                                      const copy = { ...prev };
                                      delete copy[recipe.id];
                                      return copy;
                                    });
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setCookedRecipeId(recipe.id)}
                              >
                                <ChefHat className="w-4 h-4 mr-2" />
                                Mark as Cooked
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                      );
                    })}
                  </div>
                  {!showAllRecipes && likedRecipes.length > 2 && (
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
                  )}
                </div>
              </div>
            )}

            {/* Liked Restaurants */}
            {likedRestaurants.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-[hsl(var(--crumble-dark))]">
                    Liked Restaurants
                  </h3>
                  {likedRestaurants.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllRestaurants(!showAllRestaurants)}
                    >
                      {showAllRestaurants ? 'Show Less' : `Show All (${likedRestaurants.length})`}
                    </Button>
                  )}
                </div>
                <div className="relative">
                  <div className="grid gap-4">
                    {likedRestaurants.slice(0, showAllRestaurants ? likedRestaurants.length : 2).map((restaurant, index) => (
                    <Card key={index} className="overflow-hidden">
                      <div className="relative h-32">
                        <img
                          src={restaurant.image}
                          alt={restaurant.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-lg font-bold text-[hsl(var(--crumble-dark))] truncate">
                              {restaurant.name}
                            </h4>
                            <p className="text-sm text-foreground/70 truncate">{restaurant.restaurant}</p>
                          </div>
                          <Heart className="w-5 h-5 text-red-500 fill-current flex-shrink-0 ml-2" />
                        </div>
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">{restaurant.cuisine}</Badge>
                            <Badge variant="outline">{restaurant.price}</Badge>
                          </div>
                          
                          {visitedRestaurantId === index ? (
                            <div className="flex gap-2">
                              <input
                                type="number"
                                placeholder="Cost ($)"
                                value={expenseInputs[`restaurant-${index}`] || ""}
                                onChange={(e) => setExpenseInputs(prev => ({
                                  ...prev,
                                  [`restaurant-${index}`]: e.target.value
                                }))}
                                className="flex-1 px-3 py-2 text-sm border rounded-md"
                                step="0.01"
                                min="0"
                              />
                              <Button
                                size="sm"
                                onClick={() => handleMarkAsVisited(index)}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setVisitedRestaurantId(null);
                                  setExpenseInputs(prev => {
                                    const copy = { ...prev };
                                    delete copy[`restaurant-${index}`];
                                    return copy;
                                  });
                                }}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setVisitedRestaurantId(index)}
                              className="w-full"
                            >
                              <Store className="w-4 h-4 mr-2" />
                              Mark as Visited
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                  </div>
                  {!showAllRestaurants && likedRestaurants.length > 2 && (
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />
                  )}
                </div>
              </div>
            )}

            {likedRecipes.length === 0 && likedRestaurants.length === 0 && mealHistory.length === 0 && (
              <Card className="p-8">
                <p className="text-foreground/70 text-center py-12">
                  Start discovering meals to see your personalized dashboard!
                </p>
              </Card>
            )}
          </div>
        )}

        {activeTab === "community" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-3xl font-bold text-[hsl(var(--crumble-dark))]">
              Community Feed
            </h2>
            <div className="space-y-6">
              {communityPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden">
                  {/* Post Header */}
                  <div className="p-4 flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={post.avatar} alt={post.user} />
                      <AvatarFallback>{post.user[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold text-[hsl(var(--crumble-dark))]">
                        {post.user}
                      </p>
                      <p className="text-xs text-foreground/60">{post.timeAgo}</p>
                    </div>
                  </div>

                  {/* Post Image */}
                  <img
                    src={post.image}
                    alt={post.dish}
                    className="w-full h-80 object-cover"
                  />

                  {/* Post Actions */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-2 text-foreground/70 hover:text-primary transition-colors">
                        <Heart className="w-5 h-5" />
                        <span className="text-sm font-medium">{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-2 text-foreground/70 hover:text-primary transition-colors">
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">{post.comments}</span>
                      </button>
                    </div>
                    <div>
                      <p className="text-sm">
                        <span className="font-semibold text-[hsl(var(--crumble-dark))]">
                          {post.user}
                        </span>{" "}
                        {post.caption}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-around items-center">
            <button
              onClick={() => setActiveTab("meal")}
              className={`flex flex-col items-center gap-1 transition-colors ${
                activeTab === "meal"
                  ? "text-primary"
                  : "text-foreground/50 hover:text-foreground/70"
              }`}
            >
              <UtensilsCrossed className="w-6 h-6" />
              <span className="text-xs font-medium">Meal</span>
            </button>
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex flex-col items-center gap-1 transition-colors ${
                activeTab === "profile"
                  ? "text-primary"
                  : "text-foreground/50 hover:text-foreground/70"
              }`}
            >
              <User className="w-6 h-6" />
              <span className="text-xs font-medium">Profile</span>
            </button>
            <button
              onClick={() => setActiveTab("community")}
              className={`flex flex-col items-center gap-1 transition-colors ${
                activeTab === "community"
                  ? "text-primary"
                  : "text-foreground/50 hover:text-foreground/70"
              }`}
            >
              <Users className="w-6 h-6" />
              <span className="text-xs font-medium">Community</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Home;
