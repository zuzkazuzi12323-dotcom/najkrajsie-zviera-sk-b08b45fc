import { HousePlus } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SheltersSection from "@/components/SheltersSection";
import { useActiveShelters } from "@/hooks/useShelters";
import { usePageTitle } from "@/hooks/usePageTitle";

const Shelters = () => {
  usePageTitle('Útulky, ktorým pomáhame – NajkrajšíPes.eu', 'Zoznam spolupracujúcich útulkov a možnosť podporiť ich priamo QR platbou.');
  const { data: shelters = [] } = useActiveShelters();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-3 justify-center">
          <div className="w-12 h-12 rounded-xl gradient-golden flex items-center justify-center">
            <HousePlus className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Útulky, ktorým pomáhame</h1>
        </div>
        <p className="text-center text-muted-foreground max-w-2xl mx-auto text-pretty">
          Z každej registrácie v súťaži venujeme 20 % na podporu útulkov pre zvieratá ❤️ Tieto útulky pomáhajú
          opusteným a týraným zvieratám a sú súčasťou nášho projektu.
        </p>
      </div>

      {shelters.length > 0 ? (
        <SheltersSection showHeading={false} />
      ) : (
        <div className="container mx-auto px-4 pb-20">
          <div className="bg-card rounded-2xl p-10 text-center shadow-soft border border-border max-w-2xl mx-auto">
            <p className="text-muted-foreground text-pretty text-lg">
              🐾 Prvý útulok na podporu pripravujeme! ❤️ Už čoskoro tu uvidíš komu pomáhame.
            </p>

          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Shelters;
