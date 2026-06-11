import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BookOpen, CheckCircle, Trophy, Gift, CreditCard, Handshake } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Rules = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl gradient-golden flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Pravidlá súťaže</h1>
          </div>

          <div className="bg-card rounded-2xl p-6 md:p-8 shadow-elevated space-y-8">
            <p className="text-foreground/80 text-lg leading-relaxed">
              Súťaž NajkrajšíPes.sk je online súťaž o najkrajšieho psa na Slovensku.
            </p>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" /> Ako sa zapojiť
              </h2>
              <ol className="space-y-3 text-foreground/80">
                <li className="flex gap-3"><span className="font-bold text-primary">1.</span> Majiteľ psa pridá profil psa s fotkou.</li>
                <li className="flex gap-3"><span className="font-bold text-primary">2.</span> Registrácia psa do súťaže stojí jednorazovo <strong>2,99 €</strong>. Z každej platby venujeme <strong>20 %</strong> útulkom pre opustené zvieratá ❤️</li>
                <li className="flex gap-3"><span className="font-bold text-primary">2a.</span> Hlasovať môžete <strong>1× za 24 hodín</strong> z jedného účtu.</li>
                <li className="flex gap-3"><span className="font-bold text-primary">3.</span> Po úspešnej platbe sa pes okamžite zobrazí v galérii a môže získavať hlasy od návštevníkov.</li>
              </ol>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" /> Registrácia a platba
              </h2>
              <ul className="space-y-3 text-foreground/80">
                <li className="flex gap-3"><span className="font-bold text-primary">•</span> Pes sa do súťaže zaradí <strong>automaticky až po úspešnej úhrade</strong> registračného poplatku 2,99 €.</li>
                <li className="flex gap-3"><span className="font-bold text-primary">•</span> Bez zaplatenia sa pes <strong>nezobrazí v galérii ani v rebríčku</strong> a nemôže prijímať hlasy.</li>
                <li className="flex gap-3"><span className="font-bold text-primary">•</span> Ak platbu zrušíte, zobrazí sa upozornenie, že pes nebol pridaný, a jeho neuhradená registrácia sa automaticky odstráni. Psa môžete kedykoľvek pridať znova.</li>
                <li className="flex gap-3"><span className="font-bold text-primary">•</span> Schválenie nie je manuálne – o zaradení rozhoduje výhradne úspešná platba.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" /> Ako sa vyberá víťaz
              </h2>
              <p className="text-foreground/80">
                Pes s najväčším počtom hlasov vyhráva titul <strong>Najkrajší pes Slovenska</strong>.
              </p>
              <p className="text-foreground/80 mt-2">
                Súťaž prebieha každý mesiac a každý mesiac bude vyhlásený nový víťaz. Po ukončení ročníka sa psy archivujú a už nemôžu prijímať ďalšie hlasy.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Gift className="w-5 h-5 text-primary" /> Výhra
              </h2>
              <p className="text-foreground/80">
                Víťazný pes získa <strong>darček od partnerov súťaže</strong>, <strong>certifikát víťaza</strong> a prestížne ocenenie <strong>Najkrajší pes Slovenska</strong>.
              </p>
              <p className="text-foreground/80 mt-3">
                Po ukončení súťaže bude výherca kontaktovaný e-mailom. Po potvrdení doručovacích údajov bude výhra odoslaná na adresu výhercu.
              </p>
              <p className="text-foreground/80 mt-3">
                Výherca bude kontaktovaný e-mailom alebo cez účet na stránke. Ak sa neozve do <strong>14 dní</strong> od oznámenia výhry, organizátor si vyhradzuje právo odovzdať cenu ďalšiemu súťažiacemu v poradí.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Handshake className="w-5 h-5 text-primary" /> Partneri a sponzori
              </h2>
              <p className="text-foreground/80">
                Súťaž podporujú partneri a sponzori, ktorí prispievajú cenami a pomáhajú útulkom. Ak máte záujem o spoluprácu,
                pozrite si možnosti na stránke{" "}
                <Link to="/partneri" className="text-primary font-medium hover:underline">Partneri a sponzori</Link>{" "}
                alebo nám napíšte na{" "}
                <a href="mailto:infonajkrajsipes@gmail.com" className="text-primary font-medium hover:underline">infonajkrajsipes@gmail.com</a>.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Rules;
