import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Eye } from "lucide-react";

const NameInput = () => {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleContinue = () => {
    if (name.trim()) {
      localStorage.setItem("userName", name.trim());
      navigate("/onboarding/foods");
    }
  };

  return (
    <div className="min-h-screen hexagon-pattern flex flex-col p-6">
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-between py-12 animate-in fade-in duration-500">
        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
          <div className="h-full bg-[hsl(var(--crumble-dark))] w-1/5 transition-all duration-300" />
        </div>

        {/* Content */}
        <div className="space-y-8 flex-1 flex flex-col justify-center">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-[hsl(var(--crumble-dark))]">
              What's your first name?
            </h1>
            <p className="text-foreground/70">
              You won't be able to change this later.
            </p>
          </div>

          <div className="space-y-4">
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="text-lg py-6 border-2 border-border focus:border-primary bg-input"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleContinue()}
            />
            
            {name.trim() && (
              <div className="flex items-center gap-2 text-sm text-foreground/70">
                <Eye className="w-4 h-4" />
                <span>This will be shown on your profile.</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-8">
          <Button
            variant="dark"
            size="lg"
            className="w-full"
            disabled={!name.trim()}
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

export default NameInput;
