import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UtensilsCrossed, Calendar, Coffee } from "lucide-react";

const contexts = [
  {
    id: "home",
    title: "Cook at Home",
    icon: UtensilsCrossed,
    description: "Recipe ideas for home cooking",
  },
  {
    id: "special",
    title: "Special Occasion",
    icon: Calendar,
    description: "Celebrate something special",
  },
  {
    id: "casual",
    title: "Casual Dine Out",
    icon: Coffee,
    description: "Quick and easy dining options",
  },
];

const DiningContext = () => {
  const navigate = useNavigate();

  const handleSelect = (contextId: string) => {
    localStorage.setItem("diningContext", contextId);
    if (contextId === "casual") {
      navigate("/onboarding/priority");
    } else {
      // For now, only casual is implemented
      navigate("/onboarding/priority");
    }
  };

  return (
    <div className="min-h-screen hexagon-pattern flex flex-col p-6">
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-between py-12 animate-in fade-in duration-500">
        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
          <div className="h-full bg-[hsl(var(--crumble-dark))] w-3/5 transition-all duration-300" />
        </div>

        {/* Content */}
        <div className="space-y-8 flex-1 flex flex-col justify-center">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-[hsl(var(--crumble-dark))]">
              What brings you here?
            </h1>
            <p className="text-foreground/70">
              Choose your dining situation
            </p>
          </div>

          <div className="space-y-3">
            {contexts.map((context) => {
              const Icon = context.icon;
              return (
                <Card
                  key={context.id}
                  onClick={() => handleSelect(context.id)}
                  className="p-6 cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 bg-white border-2 border-transparent hover:border-primary"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-[hsl(var(--crumble-dark))]">
                        {context.title}
                      </h3>
                      <p className="text-sm text-foreground/70">
                        {context.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiningContext;
