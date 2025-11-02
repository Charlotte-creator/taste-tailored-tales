import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, X } from "lucide-react";
import BackButton from "@/components/BackButton";

const commonAllergies = [
  "Peanuts", "Tree nuts", "Shellfish", "Fish", "Milk", "Eggs", "Soy", "Wheat", "Gluten"
];

const Allergy = () => {
  const [allergies, setAllergies] = useState<string[]>([]);
  const [customAllergy, setCustomAllergy] = useState("");
  const navigate = useNavigate();

  const toggleAllergy = (allergy: string) => {
    setAllergies(prev =>
      prev.includes(allergy)
        ? prev.filter(a => a !== allergy)
        : [...prev, allergy]
    );
  };

  const addCustomAllergy = () => {
    if (customAllergy.trim() && !allergies.includes(customAllergy.trim())) {
      setAllergies([...allergies, customAllergy.trim()]);
      setCustomAllergy("");
    }
  };

  const removeAllergy = (allergy: string) => {
    setAllergies(prev => prev.filter(a => a !== allergy));
  };

  const handleContinue = () => {
    localStorage.setItem("userAllergies", JSON.stringify(allergies));
    navigate("/onboarding/analyzing-taste");
  };

  return (
    <div className="min-h-screen hexagon-pattern flex flex-col p-6">
      <BackButton />
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-between py-12 animate-in fade-in duration-500">
        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
          <div className="h-full bg-[hsl(var(--crumble-dark))] w-1/2 transition-all duration-300" />
        </div>

        {/* Content */}
        <div className="space-y-6 flex-1 flex flex-col justify-center">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-[hsl(var(--crumble-dark))]">
              Any allergies?
            </h1>
            <p className="text-foreground/70">
              We'll make sure to avoid these in your recommendations (optional)
            </p>
          </div>

          {/* Common Allergies */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground/70">Common allergies</p>
            <div className="flex flex-wrap gap-2">
              {commonAllergies.map((allergy) => (
                <Badge
                  key={allergy}
                  variant={allergies.includes(allergy) ? "default" : "outline"}
                  className="cursor-pointer px-4 py-2 text-sm"
                  onClick={() => toggleAllergy(allergy)}
                >
                  {allergy}
                </Badge>
              ))}
            </div>
          </div>

          {/* Custom Allergy Input */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground/70">Add custom allergy</p>
            <div className="flex gap-2">
              <Input
                value={customAllergy}
                onChange={(e) => setCustomAllergy(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addCustomAllergy()}
                placeholder="Type and press Enter"
                className="flex-1"
              />
              <Button onClick={addCustomAllergy} variant="outline">
                Add
              </Button>
            </div>
          </div>

          {/* Selected Allergies */}
          {allergies.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground/70">Your allergies</p>
              <div className="flex flex-wrap gap-2">
                {allergies.map((allergy) => (
                  <Badge
                    key={allergy}
                    variant="secondary"
                    className="px-3 py-2 text-sm flex items-center gap-1"
                  >
                    {allergy}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-destructive"
                      onClick={() => removeAllergy(allergy)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <p className="text-sm text-center text-foreground/60">
            You can skip this step if you don't have any allergies
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
            Continue
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Allergy;
