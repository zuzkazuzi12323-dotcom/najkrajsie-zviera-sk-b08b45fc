import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, ArrowLeft, PawPrint, Users, Award, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { usePlatformSupporters } from "@/hooks/usePlatformSupporters";
import { useActiveSponsors } from "@/hooks/useSponsors";

const presetAmounts = [
  { value: 100, label: "1 €" },
  { value: 300, label: "3 €" },
  { value: 500, label: "5 €" },
];

const formatEur = (cents: number) => `${(cents / 100).toFixed(2).replace(".", ",")} €`;

const SupportPlatform = () => {
  const [selected, setSelected] = useState<number | null>(300);
  const [customAmount, setCustomAmount] = useState("");
  const [name, setName] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showName, setShowName] = useState(true);
  const [comment, setComment] = useState("");
  const [showComment, setShowComment] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data: supporters = [], isLoading } = usePlatformSupporters();
  const { data: sponsors = [] } = useActiveSponsors();

  const partners = sponsors.filter((s) => s.logo_url);
  const mainSupporters = supporters.filter((s) => s.is_main);
  const regularSupporters = supporters.filter((s) => !s.is_main);

  const getAmountCents = () => {
    if (selected) return selected;
    const parsed = parseFloat(customAmount.replace(",", "."));
    if (!isNaN(parsed) && parsed >= 1) return Math.round(parsed * 100);
    return 0;
  };

  const handleSupport = async () => {
    const amountCents = getAmountCents();
    if (amountCents < 100) {
      toast.error("Minimálna suma je 1 €");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-support-checkout`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: amountCents,
            name: isAnonymous || !showName ? "" : name,
            isAnonymous: isAnonymous || !showName,
            comment,
            showComment,
          }),
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

        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="w-16 h-16 rounded-2xl gradient-golden flex items-center justify-center mx-auto mb-6">
              <PawPrint className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Podporovatelia 🐾</h1>
            <p className="text-muted-foreground mb-8 text-pretty max-w-xl mx-auto">
              Podporte vývoj a prevádzku projektu NajkrajšíPes.sk.
              Z každej podpory venujeme <strong>20 % na útulky pre zvieratá</strong>.
            </p>
          </motion.div>

          {/* Amount selection */}
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            {presetAmounts.map((a) => (
              <button
                key={a.value}
                onClick={() => { setSelected(a.value); setCustomAmount(""); }}
                className={`w-24 h-24 rounded-2xl text-xl font-bold transition-all ${
                  selected === a.value
                    ? "gradient-golden text-primary-foreground shadow-golden"
                    : "bg-card text-card-foreground border border-border hover:border-primary/40"
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>

          <div className="mb-8 text-center">
            <p className="text-sm text-muted-foreground mb-2">alebo zadajte vlastnú sumu</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <input
                type="text"
                inputMode="decimal"
                placeholder="napr. 10"
                value={customAmount}
                onChange={(e) => { setCustomAmount(e.target.value); setSelected(null); }}
                onFocus={() => setSelected(null)}
                className="w-32 px-4 py-3 rounded-xl bg-input text-foreground text-center font-bold text-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="text-lg font-bold text-foreground">€</span>
            </div>
          </div>

          {/* Supporter form */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Meno alebo prezývka</label>
              <input
                type="text"
                value={name}
                disabled={isAnonymous}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tvoje meno"
                maxLength={80}
                className="w-full px-4 py-2.5 rounded-xl bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <input type="checkbox" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="w-4 h-4 accent-primary" />
              Prispieť anonymne
            </label>

            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <input type="checkbox" checked={showName && !isAnonymous} disabled={isAnonymous} onChange={(e) => setShowName(e.target.checked)} className="w-4 h-4 accent-primary" />
              Zverejniť moje meno verejne (inak sa zobrazí „Anonym")
            </label>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Komentár (voliteľné)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Napíš odkaz pre psíkov..."
                rows={2}
                maxLength={300}
                className="w-full px-4 py-2.5 rounded-xl bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
              <input type="checkbox" checked={showComment} onChange={(e) => setShowComment(e.target.checked)} className="w-4 h-4 accent-primary" />
              Zverejniť môj komentár verejne
            </label>
          </div>

          <div className="text-center">
            <button
              onClick={handleSupport}
              disabled={loading || getAmountCents() < 100}
              className="gradient-golden text-primary-foreground px-10 py-4 rounded-full font-bold shadow-golden text-lg disabled:opacity-50 inline-flex items-center gap-2"
            >
              <Heart className="w-5 h-5" />
              {loading ? "Spracovávam..." : `Podporiť ${getAmountCents() >= 100 ? formatEur(getAmountCents()) : ""}`}
            </button>
            <p className="text-xs text-muted-foreground mt-4">
              Platba prebieha bezpečne cez Stripe. Všetky platby sú dobrovoľné. Web nefunguje ako sprostredkovateľ platieb útulkom.
            </p>
          </div>

          {/* Main supporters */}
          {mainSupporters.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2 justify-center">
                <Award className="w-6 h-6 text-primary" /> Hlavní podporovatelia
              </h2>
              <p className="text-muted-foreground text-sm mb-6 text-center">Ďakujeme za výnimočnú podporu projektu ❤️</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mainSupporters.map((s) => (
                  <div key={s.id} className="bg-card border border-primary/20 rounded-2xl p-5 shadow-soft relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-10">
                      <Award className="w-16 h-16 text-primary" />
                    </div>
                    <p className="font-bold text-foreground text-lg truncate">{s.name}</p>
                    {s.comment && <p className="text-sm text-muted-foreground mt-2 text-pretty">„{s.comment}"</p>}
                    <p className="text-sm font-semibold text-primary mt-3">{formatEur(s.amount_cents)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Partners */}
          {partners.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2 justify-center">
                <Users className="w-6 h-6 text-primary" /> Naši partneri
              </h2>
              <p className="text-muted-foreground text-sm mb-6 text-center">Firmy a značky, ktoré stoja za projektom</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {partners.map((p) => {
                  const Wrapper: any = p.link_url ? "a" : "div";
                  const wrapperProps = p.link_url
                    ? { href: p.link_url, target: "_blank", rel: "noopener noreferrer" }
                    : {};
                  return (
                    <Wrapper key={p.id} {...wrapperProps}
                      className={`bg-card rounded-2xl p-5 shadow-soft border border-border flex flex-col items-center text-center ${p.link_url ? "hover:border-primary/40 hover:shadow-elevated transition-all cursor-pointer" : ""}`}>
                      <div className="w-full h-28 bg-white rounded-xl border border-border flex items-center justify-center p-4 mb-4">
                        <img src={p.logo_url!} alt={p.title} className="max-w-full max-h-full object-contain" loading="lazy" />
                      </div>
                      <h3 className="font-bold text-foreground">{p.title}</h3>
                      {p.description && <p className="text-sm text-muted-foreground mt-1 text-pretty">{p.description}</p>}
                      {p.link_url && (
                        <span className="mt-3 inline-flex items-center gap-1 text-sm text-primary font-semibold">
                          Navštíviť partnera <ExternalLink className="w-4 h-4" />
                        </span>
                      )}
                    </Wrapper>
                  );
                })}
              </div>
              <p className="text-center mt-6">
                <Link to="/partneri" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
                  Zobraziť všetkých partnerov <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </p>
            </div>
          )}

          {/* Public supporters list */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" /> Naši podporovatelia
            </h2>
            <p className="text-muted-foreground text-sm mb-6">Ďakujeme všetkým, ktorí podporili projekt ❤️</p>

            {isLoading ? (
              <p className="text-muted-foreground">Načítavam...</p>
            ) : supporters.length === 0 ? (
              <p className="text-muted-foreground">Zatiaľ žiadni podporovatelia — buď prvý! 🐶</p>
            ) : (
              <ul className="space-y-3">
                {regularSupporters.map((s) => (
                  <li key={s.id} className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">{s.name}</p>
                      {s.comment && <p className="text-sm text-muted-foreground mt-1 break-words">„{s.comment}"</p>}
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(s.created_at).toLocaleString("sk-SK", { day: "numeric", month: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <span className="shrink-0 font-bold text-primary">{formatEur(s.amount_cents)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SupportPlatform;
