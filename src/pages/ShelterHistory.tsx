import { Link } from "react-router-dom";
import { History, MapPin, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useShelterHistory } from "@/hooks/useShelters";

const fmt = (d: string) => new Date(d).toLocaleDateString("sk");

const ShelterHistory = () => {
  const { data: history = [], isLoading } = useShelterHistory();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-10 max-w-4xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl gradient-golden flex items-center justify-center mx-auto mb-4">
            <History className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">🐾 História podporovaných útulkov</h1>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-pretty">
            Prehľad útulkov, ktoré sme spoločne podporili, s obdobím podpory a vyzbieranou sumou.
          </p>
        </div>

        {isLoading ? (
          <p className="text-center text-muted-foreground py-16">Načítavam...</p>
        ) : history.length === 0 ? (
          <div className="bg-card rounded-2xl p-10 text-center shadow-soft border border-border">
            <p className="text-muted-foreground text-pretty">Zatiaľ nemáme uzavreté obdobia podpory.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {history.map((h) => (
              <div key={h.id} className="bg-card rounded-2xl p-5 shadow-soft border border-border flex flex-col">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-14 h-14 bg-white rounded-xl border border-border flex items-center justify-center p-2 shrink-0">
                    {h.shelter?.logo_url ? (
                      <img src={h.shelter.logo_url} alt={h.shelter?.name} className="max-w-full max-h-full object-contain" loading="lazy" />
                    ) : (
                      <Heart className="w-6 h-6 text-primary/40 fill-primary/20" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{h.shelter?.name || "Útulok"}</h3>
                    {h.shelter?.city && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {h.shelter.city}
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Obdobie: {fmt(h.period_start)} – {fmt(h.period_end)}
                </p>
                <p className="text-sm font-semibold text-foreground mt-1">
                  Vyzbierané: {(h.collected_cents / 100).toFixed(2)} €
                </p>
                {h.shelter && (
                  <Link to={`/utulok/${h.shelter_id}`} className="mt-3 text-sm text-primary font-semibold hover:underline self-start">
                    Detail →
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ShelterHistory;
