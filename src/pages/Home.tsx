import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UtensilsCrossed, User, Users, Sparkles, MapPin, Heart, MessageCircle } from "lucide-react";
import BackButton from "@/components/BackButton";

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
  const [activeTab, setActiveTab] = useState<Tab>("meal");
  const [likedRestaurants, setLikedRestaurants] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const liked = JSON.parse(localStorage.getItem("likedRestaurants") || "[]");
    setLikedRestaurants(liked);
  }, [activeTab]);

  const handleStartDiscovery = () => {
    navigate("/onboarding/context");
  };

  return (
    <div className="min-h-screen hexagon-pattern flex flex-col">
      <BackButton />
      {/* Header */}
      <header className="bg-white border-b border-border p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-[hsl(var(--crumble-dark))]">
            Crumble
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-6">
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
                <p className="text-2xl font-bold text-primary">0</p>
                <p className="text-sm text-foreground/70">Favorites</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">0</p>
                <p className="text-sm text-foreground/70">Tried</p>
              </Card>
              <Card className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">0</p>
                <p className="text-sm text-foreground/70">Reviews</p>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-3xl font-bold text-[hsl(var(--crumble-dark))]">
              Your Liked Restaurants
            </h2>
            {likedRestaurants.length === 0 ? (
              <Card className="p-8">
                <p className="text-foreground/70 text-center py-12">
                  No restaurants liked yet. Start discovering!
                </p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {likedRestaurants.map((restaurant, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="flex gap-4">
                      <img
                        src={restaurant.image}
                        alt={restaurant.name}
                        className="w-32 h-32 object-cover"
                      />
                      <div className="flex-1 p-4 space-y-2">
                        <div>
                          <h3 className="text-xl font-bold text-[hsl(var(--crumble-dark))]">
                            {restaurant.name}
                          </h3>
                          <p className="text-foreground/70">{restaurant.restaurant}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary">{restaurant.cuisine}</Badge>
                          <Badge variant="outline">{restaurant.price}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-foreground/70">
                          <MapPin className="w-4 h-4" />
                          {restaurant.distance}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
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
      <nav className="bg-white border-t border-border">
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
