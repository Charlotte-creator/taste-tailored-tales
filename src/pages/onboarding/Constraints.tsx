import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock, DollarSign, Flame, AlertCircle, Leaf } from "lucide-react";

const constraints = [
  { id: "time", label: "Time limit", icon: Clock },
  { id: "budget", label: "Budget", icon: DollarSign },
  { id: "calorie", label: "Calorie conscious", icon: Flame },
  { id: "allergy", label: "Allergies", icon: AlertCircle },
  { id: "vegan", label: "Vegan/Vegetarian", icon: Leaf },
];

const Constraints = () => {
  const [selected, setSelected] = useState<string[]>([]);
  const navigate = useNavigate();

  const toggleConstraint = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    localStorage.setItem("constraints", JSON.stringify(selected));
    navigate("/discover");
  };

  return (
    <div className="min-h-screen hexagon-pattern flex flex-col p-6">
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-between py-12 animate-in fade-in duration-500">
        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
          <div className="h-full bg-[hsl(var(--crumble-dark))] w-full transition-all duration-300" />
        </div>

        {/* Content */}
        <div className="space-y-8 flex-1 flex flex-col justify-center">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-[hsl(var(--crumble-dark))]">
              Any constraints?
            </h1>
            <p className="text-foreground/70">
              Select all that apply (optional)
            </p>
          </div>

          <div className="space-y-3">
            {constraints.map((constraint) => {
              const Icon = constraint.icon;
              const isSelected = selected.includes(constraint.id);
              return (
                <Card
                  key={constraint.id}
                  onClick={() => toggleConstraint(constraint.id)}
                  className={`p-5 cursor-pointer transition-all duration-200 bg-white ${
                    isSelected
                      ? "border-2 border-primary shadow-md"
                      : "border-2 border-transparent hover:border-primary/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                          isSelected
                            ? "bg-primary text-white"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="font-medium text-[hsl(var(--crumble-dark))]">
                        {constraint.label}
                      </span>
                    </div>
                    {isSelected && (
                      <Badge variant="secondary" className="bg-primary text-white">
                        Selected
                      </Badge>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>

          <p className="text-sm text-center text-foreground/60">
            You can always adjust these in your profile settings
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-8">
          <Button
            variant="dark"
            size="lg"
            className="w-full"
            onClick={handleContinue}
          >
            Start Discovering
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Constraints;
