import { motion } from "framer-motion";
import { BookOpen, CheckCircle, Trophy, Gift } from "lucide-react";
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
                <Trophy className="w-5 h-5 text-primary" /> Ako sa vyberá víťaz
              </h2>
              <p className="text-foreground/80">
                Pes s najväčším počtom hlasov vyhráva titul <strong>Najkrajší pes Slovenska</strong>.
              </p>
              <p className="text-foreground/80 mt-2">
                Súťaž prebieha každý mesiac a každý mesiac bude vyhlásený nový víťaz.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Gift className="w-5 h-5 text-primary" /> Výhra
              </h2>
              <p className="text-foreground/80">
                Víťaz získa titul "Najkrajší pes Slovenska", digitálny diplom a malý darček pre psa.
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
