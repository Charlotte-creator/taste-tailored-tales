import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

const SetupComplete = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect after 3 seconds
    const timer = setTimeout(() => {
      navigate("/home");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen hexagon-pattern flex flex-col p-6">
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-center items-center py-12 animate-in fade-in duration-500">
        {/* Success Animation */}
        <div className="space-y-8 text-center">
          <div className="flex justify-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center animate-in zoom-in duration-700">
              <CheckCircle2 className="w-16 h-16 text-primary animate-in zoom-in duration-500 delay-200" />
            </div>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-[hsl(var(--crumble-dark))]">
              You're all set!
            </h1>
            <p className="text-lg text-foreground/70">
              Your preferences have been saved
            </p>
          </div>

          <div className="glass-card p-6 rounded-lg border-2 border-primary/20 space-y-2">
            <p className="text-sm font-medium text-[hsl(var(--crumble-dark))]">
              ✓ Taste profile created
            </p>
            <p className="text-sm font-medium text-[hsl(var(--crumble-dark))]">
              ✓ Preferences saved
            </p>
            <p className="text-sm font-medium text-[hsl(var(--crumble-dark))]">
              ✓ Ready to discover
            </p>
          </div>

          <p className="text-sm text-foreground/60">
            Redirecting you to home...
          </p>
        </div>

        {/* Manual Continue Button */}
        <div className="pt-12 w-full">
          <Button
            variant="dark"
            size="lg"
            className="w-full"
            onClick={() => navigate("/home")}
          >
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SetupComplete;
