import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Lock, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase handles the recovery token automatically and emits PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
      }
    });
    // also if there's already a session, allow update
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast.error("Heslá sa nezhodujú"); return; }
    if (password.length < 6) { toast.error("Heslo musí mať aspoň 6 znakov"); return; }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Heslo bolo zmenené. Prihláste sa novým heslom.");
      await supabase.auth.signOut();
      navigate("/prihlasenie");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <Heart className="w-8 h-8 text-primary fill-primary" />
            <span className="text-2xl font-bold text-foreground">NajkrajšíPes<span className="text-primary">.eu</span></span>
          </Link>
          <h1 className="text-3xl font-bold text-foreground">Nové heslo</h1>
          <p className="text-muted-foreground mt-1">Zadajte si nové heslo k vášmu účtu.</p>
        </div>

        <div className="bg-card rounded-2xl p-6 md:p-8 shadow-elevated space-y-4">
          {!ready ? (
            <p className="text-sm text-muted-foreground text-center">Overujem odkaz na obnovenie hesla...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Nové heslo</label>
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
                <KeyRound className="w-4 h-4" /> {loading ? "Ukladám..." : "Zmeniť heslo"}
              </motion.button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
