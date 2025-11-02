import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import BackButton from "@/components/BackButton";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters long");

export default function Auth() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    document.title = mode === "signin" ? "Log in - Crumble" : "Sign up - Crumble";
  }, [mode]);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (user) {
        // Check if user has completed onboarding
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", user.id)
          .single();

        if (profile?.onboarding_completed) {
          navigate("/home", { replace: true });
        } else {
          navigate("/onboarding/name", { replace: true });
        }
      }
    };

    checkOnboardingStatus();
  }, [user, navigate]);

  const isValid = useMemo(() => {
    const emailValid = emailSchema.safeParse(email).success;
    const passValid = passwordSchema.safeParse(password).success;
    if (mode === "signup") {
      return emailValid && passValid && firstName.trim().length > 0;
    }
    return emailValid && passValid;
  }, [email, password, mode, firstName]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || loading) return;

    try {
      setLoading(true);
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
      } else {
        const redirectUrl = `${window.location.origin}/`;
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectUrl, data: { first_name: firstName } },
        });
        if (error) throw error;

        // Create profile row (avoid triggers on reserved schemas)
        const newUserId = data.user?.id;
        if (newUserId) {
          const { error: profileError } = await supabase
            .from("profiles")
            .upsert({ id: newUserId, first_name: firstName });
          if (profileError) {
            // Don't block signup, just inform softly
            console.warn("Profile upsert failed", profileError);
          }
        }
        toast.success("Account created. You're all set!");
      }
    } catch (err: any) {
      const msg = err?.message || "Something went wrong";
      toast.error(msg.includes("Invalid login") ? "Invalid email or password" : msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen hexagon-pattern flex flex-col items-center p-6">
      <BackButton />
      <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-center">
        <Card className="p-6 border-2 border-primary/20 glass-card">
          <div className="mb-6 text-center space-y-1">
            <h1 className="text-3xl font-bold text-[hsl(var(--crumble-dark))]">
              {mode === "signin" ? "Log in" : "Create your account"}
            </h1>
            <p className="text-foreground/70">
              {mode === "signin" ? "Welcome back to Crumble" : "Start personalizing your meals"}
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  placeholder="Jane"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                inputMode="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-xs text-foreground/60">Minimum 6 characters</p>
            </div>

            <Button type="submit" variant="dark" className="w-full" disabled={!isValid || loading}>
              {loading ? "Please wait..." : mode === "signin" ? "Log in" : "Sign up"}
            </Button>
          </form>

          <div className="pt-4 text-center text-sm">
            {mode === "signin" ? (
              <button
                className="text-primary underline underline-offset-4"
                onClick={() => setMode("signup")}
              >
                New here? Create an account
              </button>
            ) : (
              <button
                className="text-primary underline underline-offset-4"
                onClick={() => setMode("signin")}
              >
                Already have an account? Log in
              </button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
