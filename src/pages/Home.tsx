import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UtensilsCrossed, User, Users, Sparkles } from "lucide-react";

type Tab = "meal" | "profile" | "community";

const Home = () => {
  const [activeTab, setActiveTab] = useState<Tab>("meal");
  const navigate = useNavigate();

  const handleStartDiscovery = () => {
    navigate("/onboarding/context");
  };

  return (
    <div className="min-h-screen hexagon-pattern flex flex-col">
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
              Your Profile
            </h2>
            <Card className="p-8">
              <p className="text-foreground/70 text-center py-12">
                Profile settings coming soon...
              </p>
            </Card>
          </div>
        )}

        {activeTab === "community" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <h2 className="text-3xl font-bold text-[hsl(var(--crumble-dark))]">
              Community
            </h2>
            <Card className="p-8">
              <p className="text-foreground/70 text-center py-12">
                Community features coming soon...
              </p>
            </Card>
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
