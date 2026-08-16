import { motion } from "framer-motion";
import { PawPrint, Home } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SupportSuccess = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1 container mx-auto px-4 py-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto text-center">
        <div className="w-20 h-20 rounded-2xl gradient-golden flex items-center justify-center mx-auto mb-6">
          <PawPrint className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Ďakujeme za podporu! 🐾❤️</h1>
        <p className="text-muted-foreground mb-8">
          Tvoj príspevok pomáha udržať projekt NajkrajšíPes.eu v chode a 20 % putuje útulkom pre zvieratá.
          Tvoja podpora sa čoskoro zobrazí v zozname podporovateľov.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/podpora" className="px-6 py-3 rounded-full bg-secondary text-foreground font-semibold hover:bg-secondary/80 transition">
            Zoznam podporovateľov
          </Link>
          <Link to="/transparentnost" className="px-6 py-3 rounded-full bg-secondary text-foreground font-semibold hover:bg-secondary/80 transition">
            Transparentnosť
          </Link>
          <Link to="/" className="px-6 py-3 rounded-full gradient-golden text-primary-foreground font-semibold inline-flex items-center gap-2">
            <Home className="w-4 h-4" /> Domov
          </Link>
        </div>
      </motion.div>
    </main>
    <Footer />
  </div>
);

export default SupportSuccess;
