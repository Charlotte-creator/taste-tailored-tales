import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => navigate(-1)}
      className="fixed top-4 right-4 z-50 bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm"
    >
      <ArrowLeft className="w-5 h-5" />
    </Button>
  );
};

export default BackButton;
