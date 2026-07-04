import { Heart, MapPin, ExternalLink, HousePlus, Copy, Landmark, Star } from "lucide-react";
import { toast } from "sonner";
import { useActiveShelters, useSheltersVisible } from "@/hooks/useShelters";

/** Public section showing animal shelters supported by the contest. */
const SheltersSection = ({
  showHeading = true,
  respectVisibility = false,
}: {
  showHeading?: boolean;
  respectVisibility?: boolean;
}) => {
  const { data: shelters = [] } = useActiveShelters();
  const { data: visible = true } = useSheltersVisible();

  if (respectVisibility && !visible) return null;
  if (shelters.length === 0) return null;

  // Featured (currently supported) shelter is always shown first.
  const sorted = [...shelters].sort((a, b) => Number(b.featured) - Number(a.featured));


  return (
    <section className="container mx-auto px-4 py-12">
      {showHeading && (
        <div className="text-center mb-8 max-w-2xl mx-auto">
          <div className="w-12 h-12 rounded-xl gradient-golden flex items-center justify-center mx-auto mb-4">
            <HousePlus className="w-6 h-6 text-primary-foreground" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Útulky, ktorým pomáhame</h2>
          <p className="text-muted-foreground mt-3 text-pretty">
            Z každej registrácie v súťaži venujeme 20 % na podporu útulkov pre zvieratá ❤️
            Tieto útulky pomáhajú opusteným a týraným zvieratám a sú súčasťou nášho projektu.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {shelters.map((s) => (
          <div
            key={s.id}
            className="bg-card rounded-2xl p-6 shadow-soft border border-border flex flex-col items-center text-center"
          >
            <div className="w-full h-28 bg-white rounded-xl border border-border flex items-center justify-center p-4 mb-4">
              {s.logo_url ? (
                <img src={s.logo_url} alt={s.name} className="max-w-full max-h-full object-contain" loading="lazy" />
              ) : (
                <Heart className="w-10 h-10 text-primary/40 fill-primary/20" />
              )}
            </div>
            <h3 className="font-bold text-foreground">{s.name}</h3>
            {s.city && (
              <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> {s.city}
              </p>
            )}
            {s.description && <p className="text-sm text-muted-foreground mt-2 text-pretty">{s.description}</p>}

            {s.iban && s.show_iban && (
              <div className="mt-4 w-full bg-secondary/50 rounded-xl border border-border p-3 text-left">
                <p className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1">
                  <Landmark className="w-3.5 h-3.5" /> Číslo účtu (IBAN)
                </p>
                {s.bank_holder && <p className="text-xs text-muted-foreground mb-1">{s.bank_holder}</p>}
                <div className="flex items-center justify-between gap-2">
                  <code className="text-sm font-semibold text-foreground break-all">{s.iban}</code>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(s.iban!);
                      toast.success("IBAN skopírovaný");
                    }}
                    title="Kopírovať IBAN"
                    className="shrink-0 p-1.5 rounded-lg hover:bg-background text-muted-foreground"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">
                  Príspevok je dobrovoľný a ide priamo na účet útulku. Web nie je sprostredkovateľ platby.
                </p>
              </div>
            )}

            {s.support_url && (
              <a
                href={s.support_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 gradient-golden text-primary-foreground px-5 py-2.5 rounded-full font-semibold text-sm shadow-golden transition-transform hover:scale-105"
              >
                <Heart className="w-4 h-4" /> Podporiť útulok <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default SheltersSection;
