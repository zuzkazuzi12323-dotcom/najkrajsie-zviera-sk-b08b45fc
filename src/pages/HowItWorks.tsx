import { motion } from "framer-motion";
import { PawPrint, CreditCard, Users, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const steps = [
  { icon: PawPrint, title: "Pridajte psa do súťaže", desc: "Vytvorte profil vášho psa s fotkou a základnými informáciami." },
  { icon: CreditCard, title: "Registračný poplatok 2,99 €", desc: "Jednorazový poplatok 2,99 € za zaradenie psa do súťaže. 20 % z každej platby ide útulkom ❤️" },
  { icon: Users, title: "Získavajte hlasy od priateľov", desc: "Zdieľajte profil psa a zbierajte hlasy od rodiny a priateľov." },
  { icon: Trophy, title: "Pes s najviac hlasmi vyhrá", desc: "Víťaz získa titul Najkrajší pes Slovenska a darčeky!" },
];

const HowItWorks = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-8 text-center">Ako funguje súťaž</h1>

          <div className="space-y-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-5 bg-card rounded-2xl p-6 shadow-soft"
              >
                <div className="w-14 h-14 rounded-xl gradient-golden flex items-center justify-center flex-shrink-0">
                  <step.icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    <span className="text-primary mr-2">{i + 1}.</span>{step.title}
                  </h3>
                  <p className="text-muted-foreground">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link to="/pridat">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} className="gradient-golden text-primary-foreground px-8 py-4 rounded-full font-bold shadow-golden text-lg">
                Pridať psa za 2,99 € 🐾
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default HowItWorks;
