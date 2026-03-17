import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl gradient-golden flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Ochrana osobných údajov</h1>
          </div>

          <div className="bg-card rounded-2xl p-6 md:p-8 shadow-elevated space-y-6 text-foreground/80 leading-relaxed">
            <p>
              Stránka NajkrajšíPes.sk zbiera a spracúva iba údaje nevyhnutné pre fungovanie súťaže 
              a doručenie výhry víťazovi.
            </p>

            <div>
              <h2 className="text-lg font-bold text-foreground mb-2">Aké údaje zbierame</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>E-mailová adresa (pre registráciu a komunikáciu)</li>
                <li>Meno alebo prezývka (pre zobrazenie v súťaži)</li>
                <li>Fotografie a informácie o psovi (pre profil psa v galérii)</li>
                <li>Platobné údaje (spracúvané zabezpečene cez platobnú bránu Stripe)</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-bold text-foreground mb-2">Účel spracovania</h2>
              <p>Údaje slúžia výhradne na:</p>
              <ul className="list-disc list-inside space-y-1 mt-1">
                <li>Organizáciu a prevádzku súťaže</li>
                <li>Kontaktovanie víťaza pre doručenie výhry</li>
                <li>Spracovanie platby za registráciu psa</li>
              </ul>
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
              <h2 className="text-lg font-bold text-foreground mb-2">Kontakt</h2>
              <p>
                V prípade otázok ohľadom ochrany osobných údajov nás kontaktujte na{" "}
                <a href="mailto:infonajkrajsipes@gmail.com" className="text-primary hover:underline">
                  infonajkrajsipes@gmail.com
                </a>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Privacy;
