import { Shield } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteContent, splitLines } from "@/hooks/useSiteContent";
import { usePageTitle } from "@/hooks/usePageTitle";

const Privacy = () => {
  usePageTitle('Ochrana osobných údajov – NajkrajšíPes.eu', 'Ako spracúvame osobné údaje, cookies, sprostredkovatelia a doba uchovávania.');
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
            {t("privacy.intro", "Prevádzkovateľ: Zuzana Biháriová, fyzická osoba, kontakt infonajkrajsipes@gmail.com. Stránka NajkrajšíPes.eu zbiera a spracúva iba údaje nevyhnutné pre fungovanie súťaže a doručenie výhry víťazovi.")}
          </p>

          <div>
            <h2 className="text-lg font-bold text-foreground mb-2">{t("privacy.section1.title", "Aké údaje zbierame")}</h2>
            <ul className="list-disc list-inside space-y-1">
              {splitLines(t("privacy.section1.body", "Meno psa\nFotka psa\nMeno majiteľa\nE-mailová adresa\nPlatby cez Stripe (údaje o platobnej karte nevidíme)")).map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground mb-2">{t("privacy.section2.title", "Účel spracovania")}</h2>
            <p className="whitespace-pre-line">{t("privacy.section2.body", "Súťaž Najkrajší pes Slovenska, hlasovanie a informovanie o priebehu a výsledkoch súťaže.")}</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground mb-2">Doba uchovania</h2>
            <p>Údaje uchovávame do konca súťaže + 30 dní. Následne ich na požiadanie bezodkladne vymažeme.</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground mb-2">{t("privacy.section3.title", "Hlasovanie")}</h2>
            <p className="whitespace-pre-line">{t("privacy.section3.body", "1 účet = 1 hlas za 24 hodín. Boty, automatizované skripty a kupovanie hlasov sú zakázané.")}</p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground mb-2">{t("privacy.section4.title", "Vaše práva")}</h2>
            <p className="whitespace-pre-line">{t("privacy.section4.body", "Máte právo na prístup, opravu a vymazanie údajov – stačí nám napísať e-mailom na infonajkrajsipes@gmail.com.")}</p>
            {user && (
              <div className="mt-4">
                <Link to="/nastavenia" className="text-primary font-semibold hover:underline">
                  → Spravovať moje údaje a účet
                </Link>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground mb-2">Registrácia a platby</h2>
            <p>
              V auguste 2026 je registrácia <strong>ZADARMO</strong>. Od septembra 2026 je registrácia <strong>1,99 €</strong> dobrovoľná podpora projektu a je nevratná, okrem technickej chyby platby.
              20 % z každej úspešnej registrácie je REZERVOVANÝCH pre spolupracujúce útulky. 80 % ide na prevádzku stránky,
              vývoj, Stripe poplatky a ceny. 80 % ide na prevádzku, ceny a poplatky. Reklamácie posielajte na
              infonajkrajsipes@gmail.com do 14 dní.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground mb-2">Sprostredkovatelia (tretie strany)</h2>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Stripe Payments Europe, Ltd.</strong> – spracovanie platieb. Údaje o platobnej karte nikdy nevidíme ani neukladáme; Stripe uchováva platobné záznamy podľa svojich zákonných povinností (účtovné doklady 10 rokov).</li>
              <li><strong>Google (Gmail)</strong> – odosielanie e-mailových potvrdení a notifikácií.</li>
              <li><strong>Supabase / Lovable Cloud</strong> – hosting databázy a súborov v EU.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground mb-2">Doba uchovávania platobných údajov</h2>
            <p>
              Záznamy o platbách (suma, dátum, identifikátor transakcie, e-mail platiteľa) uchovávame <strong>10 rokov</strong>
              z dôvodu zákonnej účtovnej a daňovej povinnosti. Ostatné údaje k súťaži uchovávame do konca súťaže + 30 dní.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground mb-2">Cookies</h2>
            <p>
              Nevyhnutné cookies používame pre prihlásenie a hlasovanie. Analytické cookies spúšťame výhradne po vašom
              súhlase v cookie lište – voľbou „Len nevyhnutné“ sa analytika nespustí a existujúce analytické cookies sa vymažú.
              Súhlas môžete kedykoľvek zmeniť vymazaním údajov stránky v prehliadači.
            </p>
          </div>


          <div>
            <h2 className="text-lg font-bold text-foreground mb-2">Registrácia útulkov</h2>
            <p>
              Útulky sa môžu prihlásiť do projektu cez formulár „Spolupráca s útulkami". Údaje z formulára
              (názov, kontaktné údaje, IBAN, popis, logo) spracúvame výhradne na posúdenie žiadosti a
              prípadné zverejnenie schváleného útulku. Žiadosti sa <strong>neuverejňujú automaticky</strong> –
              každú ručne posúdi a schváli organizátor. Odoslaním formulára žiadateľ potvrdzuje pravdivosť
              údajov a súhlasí s ich spracovaním. Organizátor si vyhradzuje právo žiadosť zamietnuť alebo
              odstrániť pri podozrení na podvod alebo pri nepravdivých údajoch.
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
