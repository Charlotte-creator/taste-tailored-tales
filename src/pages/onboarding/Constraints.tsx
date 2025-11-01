import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ArrowRight, Clock, DollarSign, Leaf } from "lucide-react";
import BackButton from "@/components/BackButton";

interface ConstraintValues {
  travelTime: number;
  budget: number;
  vegan: boolean;
}

const Constraints = () => {
  const [values, setValues] = useState<ConstraintValues>({
    travelTime: 30, // default 30 minutes
    budget: 50, // default $50
    vegan: false,
  });
  const navigate = useNavigate();

  const formatTravelTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60 > 0 ? `${minutes % 60}min` : ''}`.trim();
  };

  const handleContinue = () => {
    localStorage.setItem("constraints", JSON.stringify(values));
    navigate("/onboarding/thinking-process");
  };

  return (
    <div className="min-h-screen hexagon-pattern flex flex-col p-6">
      <BackButton />
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

          <div className="space-y-6">
            {/* Travel Time Slider */}
            <Card className="p-6 bg-white border-2 border-primary/20">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-[hsl(var(--crumble-dark))]">
                      Travel time limit
                    </h3>
                    <p className="text-sm text-foreground/70">
                      Maximum travel time: {formatTravelTime(values.travelTime)}
                    </p>
                  </div>
                </div>
                <Slider
                  value={[values.travelTime]}
                  onValueChange={(val) => setValues({ ...values, travelTime: val[0] })}
                  min={5}
                  max={60}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-foreground/50">
                  <span>5 min</span>
                  <span>1 hour</span>
                </div>
              </div>
            </Card>

            {/* Budget Slider */}
            <Card className="p-6 bg-white border-2 border-primary/20">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-[hsl(var(--crumble-dark))]">
                      Budget
                    </h3>
                    <p className="text-sm text-foreground/70">
                      Maximum budget: ${values.budget}
                    </p>
                  </div>
                </div>
                <Slider
                  value={[values.budget]}
                  onValueChange={(val) => setValues({ ...values, budget: val[0] })}
                  min={5}
                  max={500}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-foreground/50">
                  <span>$5</span>
                  <span>$500</span>
                </div>
              </div>
            </Card>

            {/* Vegan/Vegetarian Toggle */}
            <Card
              onClick={() => setValues({ ...values, vegan: !values.vegan })}
              className={`p-5 cursor-pointer transition-all duration-200 bg-white ${
                values.vegan
                  ? "border-2 border-primary shadow-md"
                  : "border-2 border-transparent hover:border-primary/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      values.vegan
                        ? "bg-primary text-white"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    <Leaf className="w-5 h-5" />
                  </div>
                  <span className="font-medium text-[hsl(var(--crumble-dark))]">
                    Vegan/Vegetarian
                  </span>
                </div>
              </div>
            </Card>
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
