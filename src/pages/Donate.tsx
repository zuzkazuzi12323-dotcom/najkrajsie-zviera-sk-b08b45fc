import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";

const amounts = [
  { value: 100, label: "1 €" },
  { value: 300, label: "3 €" },
  { value: 500, label: "5 €" },
];

const Donate = () => {
  const [selected, setSelected] = useState(100);
  const [loading, setLoading] = useState(false);

  const handleDonate = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-donation-checkout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: selected }),
        }
      );
      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error(data?.error || "Nepodarilo sa vytvoriť platbu");
      }
    } catch {
      toast.error("Chyba pri komunikácii so serverom");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
          <ArrowLeft className="w-4 h-4" /> Späť na hlavnú stránku
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl gradient-golden flex items-center justify-center mx-auto mb-6">
            <Heart className="w-8 h-8 text-primary-foreground" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Podporiť útulky ❤️</h1>

          <p className="text-muted-foreground mb-8 text-pretty">
            Nemáte psíka alebo sa nechcete zapojiť do súťaže? Aj tak môžete pomôcť 🐶❤️
            <br /><br />
            Jednorazovým príspevkom podporíte útulky pre opustené zvieratá. Celá suma z vášho príspevku poputuje priamo na pomoc zvieratkám v núdzi.
          </p>

          <div className="flex justify-center gap-4 mb-8">
            {amounts.map((a) => (
              <motion.button
                key={a.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelected(a.value)}
                className={`w-24 h-24 rounded-2xl text-xl font-bold transition-all ${
                  selected === a.value
                    ? "gradient-golden text-primary-foreground shadow-golden"
                    : "bg-card text-card-foreground border border-border hover:border-primary/40"
                }`}
              >
                {a.label}
              </motion.button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDonate}
            disabled={loading}
            className="gradient-golden text-primary-foreground px-10 py-4 rounded-full font-bold shadow-golden text-lg disabled:opacity-50 flex items-center gap-2 mx-auto"
          >
            <Heart className="w-5 h-5" />
            {loading ? "Spracovávam..." : `Prispieť ${amounts.find((a) => a.value === selected)?.label}`}
          </motion.button>

          <p className="text-xs text-muted-foreground mt-6">
            Platba prebieha bezpečne cez Stripe. Nie je potrebná registrácia.
          </p>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Donate;
