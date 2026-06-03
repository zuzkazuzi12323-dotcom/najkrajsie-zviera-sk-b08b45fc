import { Handshake } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PartnersSection from "@/components/PartnersSection";
import { useActiveSponsors } from "@/hooks/useSponsors";
import { useSiteContent } from "@/hooks/useSiteContent";

const Partners = () => {
  const { data: sponsors = [] } = useActiveSponsors();
  const t = useSiteContent();
  const hasPartners = sponsors.some((s) => s.logo_url);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-2 justify-center">
          <div className="w-12 h-12 rounded-xl gradient-golden flex items-center justify-center">
            <Handshake className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">{t("partners.title", "Naši partneri")}</h1>
        </div>
      </div>
      {hasPartners ? (
        <PartnersSection />
      ) : (
        <div className="container mx-auto px-4 pb-20">
          <div className="bg-card rounded-2xl p-10 text-center shadow-soft border border-border max-w-2xl mx-auto">
            <p className="text-muted-foreground text-pretty">
              {t("partners.empty", "Momentálne pripravujeme spoluprácu s partnermi. Čoskoro tu nájdete našich partnerov.")}
            </p>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Partners;
