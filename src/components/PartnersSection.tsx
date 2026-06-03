import { ExternalLink } from "lucide-react";
import { useActiveSponsors } from "@/hooks/useSponsors";
import { useSiteContent } from "@/hooks/useSiteContent";

/** Grid of all active partners, used on homepage and the Partners page. */
const PartnersSection = ({ compact = false }: { compact?: boolean }) => {
  const { data: sponsors = [] } = useActiveSponsors();
  const t = useSiteContent();

  const partners = sponsors.filter((s) => s.logo_url);
  if (partners.length === 0) return null;

  return (
    <section className="container mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground">
          {compact ? t("home.partners.title", "Oficiálni partneri súťaže Najkrajší pes Slovenska") : t("partners.title", "Naši partneri")}
        </h2>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto text-pretty">
          {compact
            ? t("home.partners.subtitle", "Ďakujeme našim partnerom, ktorí podporujú súťaž a pomáhajú zvieratkám ❤️")
            : t("partners.subtitle", "Spoločnosti a značky, ktoré podporujú súťaž Najkrajší pes Slovenska.")}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {partners.map((p) => {
          const Wrapper: any = p.link_url ? "a" : "div";
          const wrapperProps = p.link_url
            ? { href: p.link_url, target: "_blank", rel: "noopener noreferrer" }
            : {};
          return (
            <Wrapper key={p.id} {...wrapperProps}
              className={`bg-card rounded-2xl p-6 shadow-soft border border-border flex flex-col items-center text-center ${p.link_url ? "hover:border-primary/40 hover:shadow-elevated transition-all cursor-pointer" : ""}`}>
              <div className="w-full h-28 bg-white rounded-xl border border-border flex items-center justify-center p-4 mb-4">
                <img src={p.logo_url!} alt={p.title} className="max-w-full max-h-full object-contain" loading="lazy" />
              </div>
              <h3 className="font-bold text-foreground">{p.title}</h3>
              {p.description && <p className="text-sm text-muted-foreground mt-1 text-pretty">{p.description}</p>}
              {p.link_url && (
                <span className="mt-3 inline-flex items-center gap-1 text-sm text-primary font-semibold">
                  {p.cta_label || "Navštíviť partnera"} <ExternalLink className="w-4 h-4" />
                </span>
              )}
            </Wrapper>
          );
        })}
      </div>
    </section>
  );
};

export default PartnersSection;
