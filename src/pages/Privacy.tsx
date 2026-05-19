import { Shield } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteContent, splitLines } from "@/hooks/useSiteContent";

const Privacy = () => {
  const { user } = useAuth();
  const t = useSiteContent();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl gradient-golden flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">{t("privacy.title", "Ochrana osobných údajov")}</h1>
        </div>

        <div className="bg-card rounded-2xl p-6 md:p-8 shadow-elevated space-y-6 text-foreground/80 leading-relaxed">
          <p className="whitespace-pre-line">
            {t("privacy.intro", "Stránka NajkrajšíPes.sk zbiera a spracúva iba údaje nevyhnutné pre fungovanie súťaže a doručenie výhry víťazovi. Vaše práva sú pre nás prioritou.")}
          </p>

          <div>
            <h2 className="text-lg font-bold text-foreground mb-2">{t("privacy.section1.title", "Aké údaje zbierame")}</h2>
            <ul className="list-disc list-inside space-y-1">
              {splitLines(t("privacy.section1.body", "E-mailová adresa\nMeno alebo prezývka\nFotografie a informácie o psovi\nPlatobné údaje (registračný poplatok 2,99 €, e-shop, dary)\nInformácie o príspevkoch")).map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground mb-2">{t("privacy.section2.title", "Účel spracovania")}</h2>
            <p className="whitespace-pre-line">{t("privacy.section2.body", "Údaje používame výhradne na fungovanie súťaže.")}</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground mb-2">{t("privacy.section3.title", "Hlasovanie a boost hlasy")}</h2>
            <p className="whitespace-pre-line">{t("privacy.section3.body", "Bezplatné hlasy sú obmedzené na 1 hlas za 24 hodín.")}</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground mb-2">{t("privacy.section4.title", "Vaše práva")}</h2>
            <p className="whitespace-pre-line">{t("privacy.section4.body", "Máte právo na prístup, opravu a vymazanie údajov.")}</p>
            {user && (
              <div className="mt-4">
                <Link to="/nastavenia" className="text-primary font-semibold hover:underline">
                  → Spravovať moje údaje a účet
                </Link>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground mb-2">Cookies</h2>
            <p>
              Používame nevyhnutné cookies pre správne fungovanie stránky. Analytické cookies
              používame len s vaším súhlasom.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground mb-2">Kontakt</h2>
            <p>
              V prípade otázok nás kontaktujte na{" "}
              <a href="mailto:infonajkrajsipes@gmail.com" className="text-primary hover:underline">
                infonajkrajsipes@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Privacy;
