import { Shield } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";

const Privacy = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl gradient-golden flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Ochrana osobných údajov</h1>
        </div>

        <div className="bg-card rounded-2xl p-6 md:p-8 shadow-elevated space-y-6 text-foreground/80 leading-relaxed">
          <p>
            Stránka NajkrajšíPes.sk zbiera a spracúva iba údaje nevyhnutné pre fungovanie súťaže
            a doručenie výhry víťazovi. Vaše práva sú pre nás prioritou.
          </p>

          <div>
            <h2 className="text-lg font-bold text-foreground mb-2">Aké údaje zbierame</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>E-mailová adresa (pre registráciu a komunikáciu)</li>
              <li>Meno alebo prezývka (pre zobrazenie v súťaži)</li>
              <li>Fotografie a informácie o psovi (pre profil psa v galérii)</li>
              <li>Platobné údaje (spracúvané zabezpečene cez platobnú bránu Stripe)</li>
              <li>Informácie o zakúpených boost hlasoch (priradené k vášmu účtu a profilu psa)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground mb-2">Účel spracovania</h2>
            <p>Údaje slúžia výhradne na:</p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>Organizáciu a prevádzku súťaže</li>
              <li>Kontaktovanie víťaza pre doručenie výhry</li>
              <li>Spracovanie platby za registráciu psa, boost hlasov a nákupy v e-shope</li>
              <li>Evidenciu platených boost hlasov (100 hlasov za 5 €) a ich priradenie k profilu psa</li>
              <li>Zlepšovanie služieb (analytické cookies, ak ste udelili súhlas)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground mb-2">Cookies</h2>
            <p>
              Používame nevyhnutné cookies pre správne fungovanie stránky. Analytické cookies
              používame len s vaším súhlasom. Súhlas môžete kedykoľvek zmeniť vymazaním cookies
              vo vašom prehliadači.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground mb-2">Vaše práva (GDPR)</h2>
            <p>Podľa nariadenia GDPR máte právo na:</p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li><strong>Prístup k údajom</strong> – môžete si stiahnuť všetky vaše údaje</li>
              <li><strong>Opravu údajov</strong> – môžete upraviť svoj profil kedykoľvek</li>
              <li><strong>Výmaz údajov</strong> – môžete požiadať o vymazanie celého účtu</li>
              <li><strong>Prenosnosť údajov</strong> – export údajov vo formáte JSON</li>
              <li><strong>Námietku</strong> – kontaktujte nás emailom</li>
            </ul>
            {user && (
              <div className="mt-4">
                <Link to="/nastavenia" className="text-primary font-semibold hover:underline">
                  → Spravovať moje údaje a účet
                </Link>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground mb-2">Ochrana údajov</h2>
            <p>
              Vaše údaje sú bezpečne uložené a nikdy ich neposkytujeme tretím stranám
              na marketingové účely. Platobné údaje sú spracúvané výhradne cez zabezpečenú
              platobnú bránu a nemáme k nim priamy prístup.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground mb-2">Doba uchovávania</h2>
            <p>
              Vaše údaje uchovávame po dobu existencie vášho účtu. Po vymazaní účtu budú
              všetky údaje natrvalo odstránené do 30 dní.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-bold text-foreground mb-2">Kontakt</h2>
            <p>
              V prípade otázok ohľadom ochrany osobných údajov nás kontaktujte na{" "}
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
