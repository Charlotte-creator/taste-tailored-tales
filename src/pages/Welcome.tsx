import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen hexagon-pattern flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 animate-in fade-in duration-500">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 text-4xl font-bold mb-8">
            <span className="text-5xl">🍰</span>
            <span className="text-foreground">crumble</span>
          </div>
        </div>

        {/* Hero Text */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-6xl md:text-7xl font-black text-white text-outline uppercase leading-tight">
            MAKE THE
            <br />
            FIRST BITE
          </h1>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <Button 
            variant="dark" 
            size="lg" 
            className="w-full"
            onClick={() => navigate('/onboarding/name')}
          >
            Get Started
          </Button>
          
          <Button 
            variant="light" 
            size="lg" 
            className="w-full"
            onClick={() => navigate('/onboarding/name')}
          >
            Continue as Guest
          </Button>
        </div>

        {/* Footer Text */}
        <p className="text-center text-sm text-foreground/70 pt-8">
          By signing up, you agree to our Terms.
          <br />
          We never post to social media.
        </p>
      </div>
    </div>
  );
};

export default Welcome;
