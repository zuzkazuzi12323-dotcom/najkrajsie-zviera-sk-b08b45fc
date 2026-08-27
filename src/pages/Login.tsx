import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Mail, Lock, LogIn } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [needsConfirm, setNeedsConfirm] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNeedsConfirm(false);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      const msg = error.message?.toLowerCase() || "";
      if (msg.includes("not confirmed") || msg.includes("email")) {
        setNeedsConfirm(true);
        toast.error("Najprv potvrďte svoj email kliknutím na odkaz, ktorý sme vám poslali.");
      } else {
        toast.error(error.message);
      }
    } else {
      toast.success("Úspešne prihlásený!");
      navigate("/");
    }
  };

  const handleResendConfirm = async () => {
    if (!email) { toast.error("Zadajte svoj email."); return; }
    const { error } = await supabase.auth.resend({ type: "signup", email });
    if (error) toast.error(error.message);
    else toast.success("Potvrdzovací email bol znova odoslaný.");
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) toast.error("Nepodarilo sa prihlásiť cez Google");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <Heart className="w-8 h-8 text-primary fill-primary" />
            <span className="text-2xl font-bold text-foreground">NajkrajšíPes<span className="text-primary">.eu</span></span>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Vitajte späť</h1>
          <p className="text-muted-foreground mt-1">Prihláste sa do svojho účtu</p>
        </div>

        <div className="bg-card rounded-2xl p-6 md:p-8 shadow-elevated space-y-4">
          <button onClick={handleGoogleSignIn} type="button"
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-border bg-background hover:bg-secondary transition-colors font-medium text-foreground">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Prihlásiť sa cez Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">alebo</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vas@email.sk"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" required maxLength={255} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Heslo</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" required minLength={6} />
              </div>
              <div className="text-right mt-1.5">
                <Link to="/zabudnute-heslo" className="text-xs text-primary hover:underline">Zabudli ste heslo?</Link>
              </div>
            </div>
            {needsConfirm && (
              <div className="text-xs bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl p-3">
                Váš email ešte nie je potvrdený. Skontrolujte schránku alebo
                <button type="button" onClick={handleResendConfirm} className="ml-1 underline font-medium">
                  pošlite potvrdzovací email znova
                </button>.
              </div>
            )}
            <motion.button whileTap={{ scale: 0.95 }} type="submit" disabled={loading}
              className="w-full gradient-golden text-primary-foreground py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50">
              <LogIn className="w-4 h-4" /> {loading ? "Prihlasujem..." : "Prihlásiť sa"}
            </motion.button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Nemáte účet?{" "}
          <Link to="/registracia" className="text-primary font-medium hover:underline">Zaregistrujte sa</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
