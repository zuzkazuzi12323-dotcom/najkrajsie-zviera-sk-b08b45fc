import { Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-secondary/30 mt-auto">
      <div className="container mx-auto px-4 py-12">
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
              <Link to="/registracia" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Registrácia</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-foreground">Kontakt</h4>
            <p className="text-sm text-muted-foreground">info@najkrajsipes.sk</p>
            <p className="text-sm text-muted-foreground mt-1">© 2025 NajkrajšíPes.sk</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
