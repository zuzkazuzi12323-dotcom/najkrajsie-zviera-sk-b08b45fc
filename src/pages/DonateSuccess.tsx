import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const DonateSuccess = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1 container mx-auto px-4 py-20 flex items-center justify-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full gradient-golden flex items-center justify-center mx-auto mb-6">
          <Heart className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-4">Ďakujeme za váš príspevok! ❤️</h1>
        <p className="text-muted-foreground mb-8">
          Váš príspevok poputuje priamo na podporu útulkov pre opustené zvieratá. Ďakujeme, že vám nie je osud zvieratiek ľahostajný! 🐶🐱
        </p>
        <Link to="/">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} className="gradient-golden text-primary-foreground px-8 py-4 rounded-full font-bold shadow-golden flex items-center gap-2 mx-auto">
            Späť na hlavnú stránku <ArrowRight className="w-5 h-5" />
          </motion.button>
        </Link>
      </motion.div>
    </main>
    <Footer />
  </div>
);

export default DonateSuccess;
