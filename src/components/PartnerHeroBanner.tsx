import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useActiveSponsors } from "@/hooks/useSponsors";
import { useSiteContent } from "@/hooks/useSiteContent";

/** Main partner banner shown near the top of the homepage. */
const PartnerHeroBanner = () => {
  const { data: sponsors = [] } = useActiveSponsors();
  const t = useSiteContent();

  const main = sponsors.find((s) => s.featured) || sponsors.find((s) => s.placement === "hero");
  if (!main) return null;

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="bg-card rounded-2xl p-6 md:p-8 shadow-soft border border-primary/15">
        <p className="text-xs font-semibold text-primary uppercase tracking-wider text-center mb-4">
          {t("home.partners.title", "Oficiálni partneri súťaže Najkrajší pes Slovenska")}
        </p>
        <div className="flex flex-col md:flex-row items-center gap-6">
          {main.logo_url && (
            <div className="w-40 h-24 shrink-0 bg-white rounded-xl border border-border flex items-center justify-center p-3">
              <img src={main.logo_url} alt={main.title} className="max-w-full max-h-full object-contain" loading="lazy" />
            </div>
          )}
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-bold text-foreground mb-1">{main.title}</h3>
            {main.description && <p className="text-muted-foreground text-sm text-pretty">{main.description}</p>}
          </div>
          {main.link_url && (
            <a href={main.link_url} target="_blank" rel="noopener noreferrer"
              className="gradient-golden text-primary-foreground px-6 py-3 rounded-full font-bold flex items-center gap-2 shrink-0 active:scale-95 transition-transform">
              {main.cta_label || "Navštíviť partnera"} <ArrowRight className="w-4 h-4" />
            </a>
          )}
        </div>
        <div className="text-center mt-4">
          <Link to="/partneri" className="text-sm text-primary font-semibold hover:underline">
            Zobraziť všetkých partnerov →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PartnerHeroBanner;
