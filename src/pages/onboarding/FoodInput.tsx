import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, ArrowRight, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import BackButton from "@/components/BackButton";

interface FoodItem {
  id: string;
  name?: string;
  image?: string;
}

const FoodInput = () => {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const addFoodSlot = () => {
    if (foods.length < 6) {
      const newFood = { id: Date.now().toString() };
      setFoods([...foods, newFood]);
      // Trigger file picker immediately after adding the slot
      setTimeout(() => {
        fileInputRef.current?.click();
      }, 100);
    }
  };

  const handleImageUpload = (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFoods(foods.map(food => 
          food.id === id ? { ...food, image: reader.result as string } : food
        ));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNewImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Update the most recently added food item
        setFoods(prev => {
          const lastIndex = prev.length - 1;
          if (lastIndex >= 0) {
            const updated = [...prev];
            updated[lastIndex] = { ...updated[lastIndex], image: reader.result as string };
            return updated;
          }
          return prev;
        });
      };
      reader.readAsDataURL(file);
    }
    // Reset the input so the same file can be selected again
    event.target.value = '';
  };

  const handleContinue = () => {
    if (foods.filter(f => f.image || f.name).length >= 2) {
      localStorage.setItem("userFoods", JSON.stringify(foods));
      navigate("/onboarding/allergy");
    } else {
      toast.error("Please add at least 2 favorite foods");
    }
  };

  return (
    <div className="min-h-screen hexagon-pattern flex flex-col p-6">
      <BackButton />
      {/* Hidden file input for new photos */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleNewImageUpload}
      />
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-between py-12 animate-in fade-in duration-500">
        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
          <div className="h-full bg-[hsl(var(--crumble-dark))] w-2/5 transition-all duration-300" />
        </div>

        {/* Content */}
        <div className="space-y-6 flex-1 flex flex-col justify-center">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-[hsl(var(--crumble-dark))]">
              Add your favorite foods
            </h1>
            <p className="text-foreground/70">
              At least 2 photos help us understand your taste. You can change these later.
            </p>
          </div>

          {/* Photo Grid */}
          <div className="grid grid-cols-3 gap-3">
            {foods.map((food) => (
              <Card
                key={food.id}
                className="aspect-square relative overflow-hidden border-2 border-border hover:border-primary transition-colors cursor-pointer"
              >
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  onChange={(e) => handleImageUpload(food.id, e)}
                />
                {food.image ? (
                  <img src={food.image} alt="Food" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white">
                    <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </Card>
            ))}
            
            {foods.length < 6 && (
              <Card
                onClick={addFoodSlot}
                className="aspect-square flex items-center justify-center border-2 border-dashed border-border hover:border-primary transition-colors cursor-pointer bg-white"
              >
                <Plus className="w-8 h-8 text-muted-foreground" />
              </Card>
            )}
          </div>

          <p className="text-sm text-center text-foreground/60">
            Profiles with more than 3 photos are 43% more likely to get better recommendations.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-8">
          <Button
            variant="dark"
            size="lg"
            className="w-full"
            disabled={foods.filter(f => f.image || f.name).length < 2}
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

export default FoodInput;
