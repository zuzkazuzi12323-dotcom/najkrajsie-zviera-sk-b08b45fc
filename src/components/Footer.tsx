import { Heart } from "lucide-react";
import { Link } from "react-router-dom";
import utulokTrnava from "@/assets/utulok-trnava.png";

const shelters = [
  { name: "Útulok pri kaplnke Trnava", logo: utulokTrnava, url: "https://www.trnava.utulok.sk" },
];

const Footer = () => {
  return (
    <footer className="border-t border-border bg-secondary/30 mt-auto">
      <div className="container mx-auto px-4 py-12">
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
              <Link to="/ochrana-udajov" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Ochrana údajov</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-foreground">Kontakt</h4>
            <a href="mailto:infonajkrajsipes@gmail.com" className="text-sm text-primary hover:underline">infonajkrajsipes@gmail.com</a>
            <p className="text-sm text-muted-foreground mt-3">© 2025 NajkrajšíPes.sk</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
