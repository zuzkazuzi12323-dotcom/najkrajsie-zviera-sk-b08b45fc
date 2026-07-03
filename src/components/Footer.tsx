import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import utulokTrnava from "@/assets/utulok-trnava.png";
import { useActiveSponsors } from "@/hooks/useSponsors";

const shelters = [
  { name: "Útulok pri kaplnke Trnava", logo: utulokTrnava, url: "https://www.trnava.utulok.sk" },
];

const Footer = () => {
  const { data: sponsors = [] } = useActiveSponsors();
  const partners = sponsors.filter((s) => s.logo_url);

  return (
    <footer className="border-t border-border bg-secondary/30 mt-auto">
      <div className="container mx-auto px-4 py-12">
        {/* Partner logos */}
        {partners.length > 0 && (
          <div className="mb-10 text-center">
            <h4 className="font-semibold text-foreground mb-4">Naši partneri</h4>
            <div className="flex flex-wrap items-center justify-center gap-6">
              {partners.map((p) => {
                const Wrapper: any = p.link_url ? "a" : "div";
                const wrapperProps = p.link_url
                  ? { href: p.link_url, target: "_blank", rel: "noopener noreferrer" }
                  : {};
                return (
                  <Wrapper key={p.id} {...wrapperProps} title={p.title}
                    className="w-24 h-14 bg-white rounded-lg border border-border flex items-center justify-center p-2 transition-transform hover:scale-110">
                    <img src={p.logo_url!} alt={p.title} className="max-w-full max-h-full object-contain" loading="lazy" />
                  </Wrapper>
                );
              })}
            </div>
            <p className="mt-3">
              <Link to="/partneri" className="text-sm text-primary hover:underline">Zobraziť všetkých partnerov →</Link>
            </p>
          </div>
        )}

        {/* Shelter logos */}
        <div className="mb-10 text-center">
          <h4 className="font-semibold text-foreground mb-4">Podporujeme útulky</h4>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-3">
            {shelters.map((s) => (
              <div key={s.name} title={s.name}
                className="transition-transform duration-300 hover:scale-[2.5] cursor-default z-10 relative">
                <img src={s.logo} alt={s.name} className="w-20 md:w-24 h-auto rounded-lg" />
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Podporujeme útulky a pomáhame zvieratkám ❤️</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-5 h-5 text-primary fill-primary" />
              <span className="font-bold text-foreground">NajkrajšíPes.sk</span>
            </div>
            <p className="text-sm text-muted-foreground text-pretty">
              Online súťaž o najkrajšieho psa na Slovensku. Pridajte svojho miláčika a získajte hlasy!
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-foreground">Odkazy</h4>
            <div className="flex flex-col gap-2">
              <Link to="/galeria" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Galéria</Link>
              <Link to="/pridat" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pridať psa</Link>
              <Link to="/pravidla" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pravidlá súťaže</Link>
              <Link to="/ako-funguje" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Ako funguje súťaž</Link>
              <Link to="/vitazi" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Víťazi</Link>
              <Link to="/podpora" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Podpora platformy</Link>
              <Link to="/transparentnost" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Transparentnosť</Link>
              <Link to="/partneri" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Partneri</Link>
              <Link to="/ochrana-udajov" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Ochrana údajov</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-foreground">Kontakt</h4>
            <a href="mailto:infonajkrajsipes@gmail.com" className="text-sm text-primary hover:underline">infonajkrajsipes@gmail.com</a>
            <div className="mt-4">
              <p className="text-sm font-medium text-foreground">Pre partnerov a sponzorov</p>
              <p className="text-xs text-muted-foreground mb-1">Máte záujem o spoluprácu? Napíšte nám:</p>
              <a href="mailto:infonajkrajsipes@gmail.com?subject=Záujem o spoluprácu / sponzoring" className="text-sm text-primary hover:underline">infonajkrajsipes@gmail.com</a>
              <p className="mt-1">
                <Link to="/partneri" className="text-xs text-primary hover:underline">Viac o spolupráci →</Link>
              </p>
            </div>
            <p className="text-sm text-foreground mt-4">Organizátor: <span className="font-medium">Zuzana Biháriová</span></p>
            <p className="text-sm text-muted-foreground mt-1">© 2025 NajkrajšíPes.sk</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
