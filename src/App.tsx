import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Welcome from "./pages/Welcome";
import NameInput from "./pages/onboarding/NameInput";
import FoodInput from "./pages/onboarding/FoodInput";
import DiningContext from "./pages/onboarding/DiningContext";
import Priority from "./pages/onboarding/Priority";
import Constraints from "./pages/onboarding/Constraints";
import Discover from "./pages/Discover";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/onboarding/name" element={<NameInput />} />
          <Route path="/onboarding/foods" element={<FoodInput />} />
          <Route path="/onboarding/context" element={<DiningContext />} />
          <Route path="/onboarding/priority" element={<Priority />} />
          <Route path="/onboarding/constraints" element={<Constraints />} />
          <Route path="/discover" element={<Discover />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
