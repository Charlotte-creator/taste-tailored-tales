import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Sparkles, Heart, Globe } from "lucide-react";
import BackButton from "@/components/BackButton";

const priorities = [
  {
    id: "new",
    title: "New Restaurant",
    icon: Sparkles,
    description: "Discover places you haven't tried",
  },
  {
    id: "comfort",
    title: "Comfort Food",
    icon: Heart,
    description: "Your go-to favorites",
  },
  {
    id: "cuisine",
    title: "Cuisine Type",
    icon: Globe,
    description: "Specific food style",
  },
];

const Priority = () => {
  const [selected, setSelected] = useState<string>("");
  const navigate = useNavigate();

  const handleContinue = () => {
    if (selected) {
      localStorage.setItem("priority", selected);
      navigate("/onboarding/constraints");
    }
  };

  return (
    <div className="min-h-screen hexagon-pattern flex flex-col p-6">
      <BackButton />
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-between py-12 animate-in fade-in duration-500">
        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
          <div className="h-full bg-[hsl(var(--crumble-dark))] w-4/5 transition-all duration-300" />
        </div>

        {/* Content */}
        <div className="space-y-8 flex-1 flex flex-col justify-center">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-[hsl(var(--crumble-dark))]">
              What's your priority?
            </h1>
            <p className="text-foreground/70">
              Help us narrow down your options
            </p>
          </div>

          <div className="space-y-3">
            {priorities.map((priority) => {
              const Icon = priority.icon;
              const isSelected = selected === priority.id;
              return (
                <Card
                  key={priority.id}
                  onClick={() => setSelected(priority.id)}
                  className={`p-6 cursor-pointer transition-all duration-200 bg-white ${
                    isSelected
                      ? "border-2 border-primary shadow-lg scale-[1.02]"
                      : "border-2 border-transparent hover:border-primary/50 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-primary text-white"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-[hsl(var(--crumble-dark))]">
                        {priority.title}
                      </h3>
                      <p className="text-sm text-foreground/70">
                        {priority.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-8">
          <Button
            variant="dark"
            size="lg"
            className="w-full"
            disabled={!selected}
            onClick={handleContinue}
          >
            Continue
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Priority;
