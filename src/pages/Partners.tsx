import { useEffect } from "react";
import { motion } from "framer-motion";
import { Handshake, CheckCircle2, Mail } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const benefits = [
  "Logo na webe najkrajsípes.eu",
  "Promo na IG + FB",
  "Spomenutie vo finále",
  "Možnosť dodať ceny pre výhercov (granule, hračky, poukážky)",
];

const PARTNER_EMAIL = "info@najkrajsipes.eu";

const Partners = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="container mx-auto px-4 py-16 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-2xl gradient-golden flex items-center justify-center mx-auto mb-6">
            <Handshake className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-6">
            Staňte sa partnerom súťaže najkrajsípes.eu 2026
          </h1>
          <p className="text-gray-700 text-lg mb-4 text-pretty">
            Hľadáme partnerov pre najväčšiu online súťaž o najkrajšieho psa Slovenska.
          </p>

          <div className="bg-white rounded-2xl p-8 shadow-soft border border-gray-200 text-left mt-8">
            <h2 className="text-xl font-bold text-black mb-4 text-center">Výhody</h2>
            <ul className="space-y-3 max-w-md mx-auto">
              {benefits.map((b, i) => (
                <motion.li
                  key={b}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-gray-800 text-pretty">{b}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <div className="mt-10">
            <a
              href={`mailto:${PARTNER_EMAIL}?subject=Záujem o partnerstvo – najkrajsípes.eu 2026`}
              className="inline-flex items-center gap-2 gradient-golden text-primary-foreground px-8 py-4 rounded-full font-bold shadow-golden transition-transform hover:scale-105"
            >
              <Mail className="w-5 h-5" />
              Mám záujem o partnerstvo
            </a>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Partners;
