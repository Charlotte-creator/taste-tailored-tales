import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Welcome from "./pages/Welcome";
import NameInput from "./pages/onboarding/NameInput";
import FoodInput from "./pages/onboarding/FoodInput";
import Allergy from "./pages/onboarding/Allergy";
import CuisineSummary from "./pages/onboarding/CuisineSummary";
import SetupComplete from "./pages/onboarding/SetupComplete";
import DiningContext from "./pages/onboarding/DiningContext";
import Priority from "./pages/onboarding/Priority";
import Constraints from "./pages/onboarding/Constraints";
import CookAtHome from "./pages/onboarding/CookAtHome";
import Home from "./pages/Home";
import Discover from "./pages/Discover";
import Profile from "./pages/Profile";
import ThinkingProcess from "./pages/onboarding/ThinkingProcess";
import AnalyzingTaste from "./pages/onboarding/AnalyzingTaste";
import Auth from "./pages/Auth";
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
          <Route path="/onboarding/allergy" element={<Allergy />} />
          <Route path="/onboarding/analyzing-taste" element={<AnalyzingTaste />} />
          <Route path="/onboarding/cuisine-summary" element={<CuisineSummary />} />
          <Route path="/onboarding/setup-complete" element={<SetupComplete />} />
          <Route path="/onboarding/context" element={<DiningContext />} />
          <Route path="/onboarding/priority" element={<Priority />} />
          <Route path="/onboarding/constraints" element={<Constraints />} />
          <Route path="/onboarding/cook-at-home" element={<CookAtHome />} />
          <Route path="/onboarding/thinking-process" element={<ThinkingProcess />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/home" element={<Home />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/profile" element={<Profile />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
