import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Mail, Lock, UserPlus, User } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";


const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast.error("Heslá sa nezhodujú"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { display_name: displayName || email.split("@")[0] }, emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setRegisteredEmail(email);
      toast.success("Účet vytvorený! Skontrolujte svoj email.");
    }
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

  if (registeredEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <Heart className="w-8 h-8 text-primary fill-primary" />
            <span className="text-2xl font-bold text-foreground">NajkrajšíPes<span className="text-primary">.eu</span></span>
          </Link>
          <div className="bg-card rounded-2xl p-8 shadow-elevated">
            <div className="w-16 h-16 rounded-full gradient-golden flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-3">Skontrolujte svoj Gmail 📧</h1>
            <p className="text-foreground/80 mb-2">
              Poslali sme potvrdzovací odkaz na:
            </p>
            <p className="font-semibold text-primary mb-4 break-all">{registeredEmail}</p>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-left text-sm text-foreground/80 mb-5">
              <p className="font-semibold text-foreground mb-2">📩 Ako pokračovať:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Otvorte si <strong>Gmail</strong> (alebo iný email)</li>
                <li>Nájdite správu od <strong>NajkrajšíPes.eu</strong></li>
                <li>Kliknite na odkaz <strong>„Potvrdiť registráciu"</strong></li>
                <li>Po potvrdení sa môžete prihlásiť</li>
              </ol>
              <p className="mt-3 text-xs text-muted-foreground">
                Ak email nevidíte, skontrolujte priečinok <strong>Spam / Promo</strong>.
              </p>
            </div>
            <button onClick={() => navigate("/prihlasenie")}
              className="w-full gradient-golden text-primary-foreground py-3 rounded-xl font-bold">
              Prejsť na prihlásenie
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <Heart className="w-8 h-8 text-primary fill-primary" />
            <span className="text-2xl font-bold text-foreground">NajkrajšíPes<span className="text-primary">.eu</span></span>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Vytvorte si účet</h1>
          <p className="text-muted-foreground mt-1">Pridajte svojho psa do súťaže</p>
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
            Registrovať sa cez Google
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">alebo</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Meno</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Vaše meno"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" maxLength={50} />
              </div>
            </div>
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
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimálne 6 znakov"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" required minLength={6} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Potvrdiť heslo</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Zopakujte heslo"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" required minLength={6} />
              </div>
            </div>
            <motion.button whileTap={{ scale: 0.95 }} type="submit" disabled={loading}
              className="w-full gradient-golden text-primary-foreground py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50">
              <UserPlus className="w-4 h-4" /> {loading ? "Registrujem..." : "Zaregistrovať sa"}
            </motion.button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Už máte účet?{" "}<Link to="/prihlasenie" className="text-primary font-medium hover:underline">Prihláste sa</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;
