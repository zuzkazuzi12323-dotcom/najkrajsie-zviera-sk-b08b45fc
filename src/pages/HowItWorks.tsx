import { motion } from "framer-motion";
import { PawPrint, CreditCard, Users, Trophy, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PAID_PRICE_LABEL, REGISTRATION_FREE, RESERVED_SHARE_TEXT, ROUND_LABEL, FREE_ROUND_NOTICE, MONTHLY_CYCLE_TEXT } from "@/lib/pricing";

const HowItWorks = () => {
  const free = REGISTRATION_FREE;

  const steps = [
    { icon: PawPrint, title: "Pridajte svojho psa", desc: "Vytvorte profil vášho psa s fotkou a základnými informáciami." },
    {
      icon: CreditCard,
      title: free ? "Registrácia v auguste je zadarmo" : `Podpora projektu ${PAID_PRICE_LABEL}`,
      desc: free
        ? FREE_ROUND_NOTICE
        : `Podpora projektu ${PAID_PRICE_LABEL} za psa. ${RESERVED_SHARE_TEXT}`,
    },
    { icon: CheckCircle2, title: "Pes sa automaticky zaradí do hlasovania", desc: "Po registrácii sa pes ihneď zaradí do verejného hlasovania." },
    { icon: Users, title: "Zdieľajte profil a zbierajte hlasy", desc: "Zdieľajte profil psa a zbierajte hlasy od rodiny a priateľov." },
    { icon: Trophy, title: "Pes s najviac hlasmi vyhráva", desc: "Víťaz získa titul Najkrajší pes Slovenska a darčeky!" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 text-center">Ako funguje súťaž</h1>
          <p className="text-center text-muted-foreground mb-8">{ROUND_LABEL} — {MONTHLY_CYCLE_TEXT}</p>
          {free && (
            <div className="mb-8 rounded-3xl border-2 border-primary bg-primary/10 p-6 text-center shadow-golden">
              <p className="text-2xl font-extrabold text-foreground">🔥 AUGUSTOVÁ AKCIA 🔥</p>
              <p className="mt-2 font-bold text-foreground">Registrácia psa je počas celej augustovej súťaže ZADARMO.</p>
              <p className="text-muted-foreground">Počas augusta 2026 je registrácia ZADARMO. Od septembra 2026 bude registrácia 1,99 €.</p>
            </div>
          )}

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

          <div className="mt-8 bg-card rounded-2xl p-6 shadow-soft border border-primary/20">
            <h3 className="text-lg font-bold text-foreground mb-2">❤️ Útulok týždňa</h3>
            <p className="text-muted-foreground">
              Okrem súťaže každý týždeň vyberáme jeden <strong>útulok týždňa</strong>, ktorý spoločne podporujeme.
              Prispieť mu môžete priamo cez SEPA QR kód na jeho profile — 100 % vášho príspevku ide priamo na účet útulku.
            </p>
          </div>


          <div className="text-center mt-10">
            <Link to="/pridat">
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} className="gradient-golden text-primary-foreground px-8 py-4 rounded-full font-bold shadow-golden text-lg">
                Pridať psa 🐾
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
