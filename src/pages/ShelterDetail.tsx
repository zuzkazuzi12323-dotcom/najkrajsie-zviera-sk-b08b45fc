import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Heart, MapPin, Landmark, Copy, ExternalLink, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useShelter } from "@/hooks/useShelters";
import { generateSepaQr } from "@/lib/sepaQr";

const PRESETS = [500, 1000, 2000, 5000];

const ShelterDetail = () => {
  const { id } = useParams();
  const { data: shelter, isLoading } = useShelter(id);
  const [qr, setQr] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [custom, setCustom] = useState("");

  const amountCents = (() => {
    if (custom) {
      const parsed = parseFloat(custom.replace(",", "."));
      return !isNaN(parsed) && parsed > 0 ? Math.round(parsed * 100) : 0;
    }
    return selected || 0;
  })();

  useEffect(() => {
    if (shelter?.iban && shelter.show_iban) {
      generateSepaQr({
        iban: shelter.iban,
        name: shelter.bank_holder || shelter.name,
        amountCents,
        message: `Podpora ${shelter.name}`,
      })
        .then(setQr)
        .catch(() => setQr(null));
    } else {
      setQr(null);
    }
  }, [shelter, amountCents]);

  const collected = ((shelter?.collected_cents || 0) / 100);
  const goal = ((shelter?.goal_cents || 0) / 100);
  const pct = goal > 0 ? Math.min(100, Math.round((collected / goal) * 100)) : 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Späť
        </Link>

        {isLoading ? (
          <p className="text-center text-muted-foreground py-16">Načítavam...</p>
        ) : !shelter ? (
          <p className="text-center text-muted-foreground py-16">Útulok sa nenašiel.</p>
        ) : (
          <div className="bg-card rounded-3xl border border-border shadow-elevated overflow-hidden">
            <div className="p-6 md:p-10">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-32 h-32 shrink-0 bg-white rounded-2xl border border-border flex items-center justify-center p-3">
                  {shelter.logo_url ? (
                    <img src={shelter.logo_url} alt={shelter.name} className="max-w-full max-h-full object-contain" />
                  ) : (
                    <Heart className="w-14 h-14 text-primary/40 fill-primary/20" />
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">{shelter.name}</h1>
                  {shelter.city && (
                    <p className="text-muted-foreground mt-1 flex items-center gap-1 justify-center sm:justify-start">
                      <MapPin className="w-4 h-4" /> {shelter.city}
                    </p>
                  )}
                </div>
              </div>

              {goal > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-semibold text-foreground">{collected.toFixed(2)} €</span>
                    <span className="text-muted-foreground">Cieľ: {goal.toFixed(2)} €</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-secondary overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-600" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )}

              {shelter.description && (
                <p className="text-muted-foreground mt-6 text-pretty whitespace-pre-line">{shelter.description}</p>
              )}

              {shelter.iban && shelter.show_iban && (
                <div className="mt-6 bg-secondary/50 rounded-2xl border border-border p-5">
                  <p className="text-sm font-medium text-foreground flex items-center gap-2 mb-2">
                    <Landmark className="w-4 h-4 text-primary" /> Číslo účtu (IBAN)
                  </p>
                  {shelter.bank_holder && <p className="text-sm text-muted-foreground mb-1">{shelter.bank_holder}</p>}
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-base font-semibold text-foreground break-all">{shelter.iban}</code>
                    <button
                      onClick={() => { navigator.clipboard.writeText(shelter.iban!); toast.success("IBAN skopírovaný"); }}
                      title="Kopírovať IBAN"
                      className="shrink-0 p-2 rounded-lg hover:bg-background text-muted-foreground"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  {qr && (
                    <div className="mt-4 flex flex-col items-center">
                      <p className="text-xs text-muted-foreground mb-2">Naskenujte QR kód v mobilnej aplikácii vašej banky</p>
                      <img src={qr} alt="QR platba" className="w-48 h-48 rounded-xl bg-white p-2 border border-border" />
                    </div>
                  )}
                </div>
              )}

              {shelter.support_url && (
                <a
                  href={shelter.support_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:scale-105 active:scale-95 transition-transform"
                >
                  Navštíviť web <ExternalLink className="w-4 h-4" />
                </a>
              )}

              <p className="text-xs text-muted-foreground mt-6 leading-relaxed border-t border-border pt-4">
                Peniaze posielate priamo na účet útulku. NajkrajšíPes.sk nie je sprostredkovateľ platby a neprijíma tieto
                finančné prostriedky.
              </p>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ShelterDetail;
