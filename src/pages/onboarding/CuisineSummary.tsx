import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Sparkles } from "lucide-react";
import BackButton from "@/components/BackButton";

const CuisineSummary = () => {
  const [summary, setSummary] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Get the AI-generated summary from localStorage
    const generatedSummary = localStorage.getItem("cuisineSummary") || "";
    setSummary(generatedSummary);
  }, []);

  const handleConfirm = () => {
    localStorage.setItem("cuisineSummary", summary);
    navigate("/onboarding/setup-complete");
  };

  return (
    <div className="min-h-screen hexagon-pattern flex flex-col p-6">
      <BackButton />
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-between py-12 animate-in fade-in duration-500">
        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
          <div className="h-full bg-[hsl(var(--crumble-dark))] w-3/4 transition-all duration-300" />
        </div>

        {/* Content */}
        <div className="space-y-8 flex-1 flex flex-col justify-center">
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
              <h1 className="text-4xl font-bold text-[hsl(var(--crumble-dark))]">
                Your taste profile
              </h1>
            </div>
            <p className="text-foreground/70">
              Here's what we learned about your preferences
            </p>
          </div>

          <div className="space-y-4">
            {isEditing ? (
              <Textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="min-h-[120px] text-lg bg-white"
                autoFocus
              />
            ) : (
              <div className="glass-card p-6 rounded-lg border-2 border-primary/20">
                <p className="text-lg text-[hsl(var(--crumble-dark))] leading-relaxed">
                  "{summary}"
                </p>
              </div>
            )}

            <Button
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
              className="w-full"
            >
              {isEditing ? "Preview" : "Edit Summary"}
            </Button>
          </div>

          <p className="text-sm text-center text-foreground/60">
            This helps us find the perfect recommendations for you
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-8 space-y-3">
          <Button
            variant="dark"
            size="lg"
            className="w-full"
            onClick={handleConfirm}
          >
            That's correct!
            <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CuisineSummary;
