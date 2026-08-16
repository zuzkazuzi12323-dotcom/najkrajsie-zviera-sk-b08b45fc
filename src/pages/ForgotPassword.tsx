import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Mail, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-hesla`,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      setSent(true);
      toast.success("Skontrolujte email pre obnovenie hesla.");
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
          <h1 className="text-3xl font-bold text-foreground">Zabudnuté heslo</h1>
          <p className="text-muted-foreground mt-1">Pošleme vám odkaz na obnovenie hesla.</p>
        </div>

        <div className="bg-card rounded-2xl p-6 md:p-8 shadow-elevated space-y-4">
          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <p className="text-foreground">
                Na <strong>{email}</strong> sme poslali odkaz na obnovenie hesla. Skontrolujte si schránku (aj spam).
              </p>
              <Link to="/prihlasenie" className="inline-block text-primary font-medium hover:underline">
                Späť na prihlásenie
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vas@email.sk"
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" required maxLength={255} />
                </div>
              </div>
              <motion.button whileTap={{ scale: 0.95 }} type="submit" disabled={loading}
                className="w-full gradient-golden text-primary-foreground py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50">
                <Send className="w-4 h-4" /> {loading ? "Odosielam..." : "Poslať odkaz na obnovu"}
              </motion.button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link to="/prihlasenie" className="text-primary font-medium hover:underline">Späť na prihlásenie</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
