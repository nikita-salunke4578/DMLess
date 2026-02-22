import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signIn, signUp } from "@/lib/supabase-helpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        navigate("/dashboard");
      } else {
        const { error } = await signUp(email, password);
        if (error) throw error;
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account before signing in.",
        });
        setIsLogin(true);
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-20 -left-32 w-[400px] h-[400px] rounded-full opacity-15 blur-3xl pointer-events-none" style={{ background: "var(--gradient-primary)" }} />
      <div className="absolute bottom-20 -right-32 w-[300px] h-[300px] rounded-full opacity-10 blur-3xl pointer-events-none" style={{ background: "var(--gradient-accent)" }} />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="h-11 w-11 rounded-xl gradient-bg flex items-center justify-center glow-primary">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold font-display text-foreground">Dmless</span>
          </div>
          <p className="text-muted-foreground text-sm">
            {isLogin ? "Sign in to your recruiter dashboard" : "Create your recruiter account"}
          </p>
        </div>

        <div className="glass-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} />
            </div>
            <Button type="submit" className="w-full gradient-bg border-0 glow-primary" disabled={loading}>
              {loading ? "Loading..." : isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-primary font-medium hover:underline">
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
