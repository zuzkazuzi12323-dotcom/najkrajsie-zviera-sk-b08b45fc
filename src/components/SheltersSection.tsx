import { Heart, MapPin, HousePlus, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useActiveShelters, useSheltersVisible } from "@/hooks/useShelters";

/** Public section showing animal shelters supported by the contest (compact grid). */
const SheltersSection = ({
  showHeading = true,
  respectVisibility = false,
  excludeFeatured = false,
}: {
  showHeading?: boolean;
  respectVisibility?: boolean;
  excludeFeatured?: boolean;
}) => {
  const { data: shelters = [] } = useActiveShelters();
  const { data: visible = true } = useSheltersVisible();

  if (respectVisibility && !visible) return null;

  const unique = Array.from(new Map(shelters.map((s) => [s.id, s])).values());
  const filtered = excludeFeatured ? unique.filter((s) => !s.featured) : unique;
  if (filtered.length === 0) return null;

  const sorted = [...filtered].sort((a, b) => Number(b.featured) - Number(a.featured));

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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
        {sorted.map((s) => (
          <Link
            key={s.id}
            to={`/utulok/${s.id}`}
            className={`relative bg-card rounded-2xl p-4 shadow-soft border flex flex-col items-center text-center max-h-[280px] transition-transform hover:scale-[1.03] ${
              s.featured ? "border-primary ring-1 ring-primary/30" : "border-border"
            }`}
          >
            {s.featured && (
              <span className="absolute top-2 right-2 inline-flex items-center gap-1 bg-primary/10 text-primary text-[10px] font-semibold px-2 py-0.5 rounded-full">
                <Star className="w-2.5 h-2.5 fill-primary" /> Podporujeme
              </span>
            )}
            <div className="w-20 h-20 bg-white rounded-xl border border-border flex items-center justify-center p-2 mb-3 mt-2">
              {s.logo_url ? (
                <img src={s.logo_url} alt={s.name} className="max-w-full max-h-full object-contain" loading="lazy" />
              ) : (
                <Heart className="w-8 h-8 text-primary/40 fill-primary/20" />
              )}
            </div>
            <h3 className="font-bold text-sm text-foreground line-clamp-2">{s.name}</h3>
            {s.city && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {s.city}
              </p>
            )}
            <span className="mt-auto pt-3 inline-flex items-center gap-1.5 gradient-golden text-primary-foreground px-4 py-2 rounded-full font-semibold text-xs shadow-golden">
              <Heart className="w-3.5 h-3.5" /> Podporiť
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default SheltersSection;

