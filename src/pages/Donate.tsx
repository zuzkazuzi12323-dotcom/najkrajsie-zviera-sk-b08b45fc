import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, ArrowLeft, Share2, Copy, Facebook } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";

const presetAmounts = [
  { value: 100, label: "1 €" },
  { value: 300, label: "3 €" },
  { value: 500, label: "5 €" },
];

const Donate = () => {
  const [selected, setSelected] = useState<number | null>(100);
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const getAmountCents = () => {
    if (selected) return selected;
    const parsed = parseFloat(customAmount.replace(",", "."));
    if (!isNaN(parsed) && parsed >= 1) return Math.round(parsed * 100);
    return 0;
  };

  const handleDonate = async () => {
    const amountCents = getAmountCents();
    if (amountCents < 100) {
      toast.error("Minimálna suma je 1 €");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-donation-checkout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: amountCents }),
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

  const displayAmount = () => {
    if (selected) return presetAmounts.find((a) => a.value === selected)?.label;
    const cents = getAmountCents();
    if (cents > 0) return `${(cents / 100).toFixed(2).replace(".", ",")} €`;
    return "—";
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

          <div className="flex justify-center gap-3 mb-4">
            {presetAmounts.map((a) => (
              <motion.button
                key={a.value}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setSelected(a.value); setCustomAmount(""); }}
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

          {/* Custom amount */}
          <div className="mb-8">
            <p className="text-sm text-muted-foreground mb-2">alebo zadajte vlastnú sumu</p>
            <div className="flex items-center justify-center gap-2">
              <input
                type="text"
                inputMode="decimal"
                placeholder="napr. 10"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelected(null);
                }}
                onFocus={() => setSelected(null)}
                className="w-32 px-4 py-3 rounded-xl bg-input text-foreground text-center font-bold text-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="text-lg font-bold text-foreground">€</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDonate}
            disabled={loading || getAmountCents() < 100}
            className="gradient-golden text-primary-foreground px-10 py-4 rounded-full font-bold shadow-golden text-lg disabled:opacity-50 flex items-center gap-2 mx-auto"
          >
            <Heart className="w-5 h-5" />
            {loading ? "Spracovávam..." : `Prispieť ${displayAmount()}`}
          </motion.button>

          <p className="text-xs text-muted-foreground mt-6">
            Platba prebieha bezpečne cez Stripe. Nie je potrebná registrácia. Minimálna suma je 1 €.
          </p>

          {/* Share section */}
          <div className="mt-10 pt-8 border-t border-border">
            <p className="text-sm font-semibold text-foreground mb-3 flex items-center justify-center gap-2">
              <Share2 className="w-4 h-4" /> Zdieľaj a pomôž ešte viac útulkom
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Po kliknutí sa otvorí stránka „Podporiť útulky" — návštevník si sám vyberie sumu.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {(() => {
                // Use the public published URL for sharing.
                // The preview/sandbox URL (id-preview--*.lovable.app) requires login,
                // so sharing it on Facebook/WhatsApp would force visitors into Lovable login.
                // Detect preview/sandbox host and fall back to the published URL.
                const PUBLISHED_URL = "https://najkrajsie-zviera-sk.lovable.app";
                const isPreview = /id-preview--|lovableproject\.com|localhost|127\.0\.0\.1/.test(window.location.host);
                const shareUrl = isPreview
                  ? `${PUBLISHED_URL}/podporit`
                  : `${window.location.origin}/podporit`;
                const shareText = "Pomôž útulkom pre opustených psíkov ❤️ Prispej, koľko môžeš na NajkrajšíPes.sk";
                const copyLink = async () => {
                  try {
                    await navigator.clipboard.writeText(shareUrl);
                    toast.success("Odkaz skopírovaný 📋");
                  } catch {
                    toast.error("Nepodarilo sa skopírovať odkaz");
                  }
                };
                const shareNative = async () => {
                  if (navigator.share) {
                    try { await navigator.share({ title: "Podporiť útulky", text: shareText, url: shareUrl }); } catch {}
                  } else {
                    copyLink();
                  }
                };
                const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
                const wa = `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`;
                const tg = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
                const x = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
                return (
                  <>
                    <a href={fb} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-full bg-[#1877F2] text-white text-sm font-semibold hover:opacity-90 transition flex items-center gap-2">
                      <Facebook className="w-4 h-4" /> Facebook
                    </a>
                    <a href={wa} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-full bg-[#25D366] text-white text-sm font-semibold hover:opacity-90 transition">
                      WhatsApp
                    </a>
                    <a href={tg} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-full bg-[#229ED9] text-white text-sm font-semibold hover:opacity-90 transition">
                      Telegram
                    </a>
                    <a href={x} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-full bg-foreground text-background text-sm font-semibold hover:opacity-90 transition">
                      X
                    </a>
                    <button onClick={copyLink} className="px-4 py-2 rounded-full bg-secondary text-foreground text-sm font-semibold hover:bg-secondary/80 transition flex items-center gap-2">
                      <Copy className="w-4 h-4" /> Kopírovať odkaz
                    </button>
                    <button onClick={shareNative} className="px-4 py-2 rounded-full gradient-golden text-primary-foreground text-sm font-semibold hover:opacity-90 transition flex items-center gap-2">
                      <Share2 className="w-4 h-4" /> Zdieľať
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Donate;
