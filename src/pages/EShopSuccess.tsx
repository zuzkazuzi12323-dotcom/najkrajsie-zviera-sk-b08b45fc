import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, ShoppingBag, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const EShopSuccess = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <div className="flex-1 flex items-center justify-center px-4 py-20">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full gradient-golden flex items-center justify-center mx-auto mb-6">
          <Heart className="w-10 h-10 text-primary-foreground fill-primary-foreground" />
        </div>
        <h1 className="text-3xl font-extrabold text-foreground mb-3">Ďakujeme za nákup!</h1>
        <p className="text-muted-foreground mb-8">
          Časť výťažku poputuje útulkom pre zvieratá ❤️ Ďakujeme, že pomáhate opusteným zvieratkám.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/eshop">
            <button className="gradient-golden text-primary-foreground px-6 py-3 rounded-full font-semibold flex items-center gap-2 shadow-golden">
              <ShoppingBag className="w-4 h-4" /> Pokračovať v nákupe
            </button>
          </Link>
          <Link to="/galeria">
            <button className="bg-secondary text-foreground px-6 py-3 rounded-full font-semibold flex items-center gap-2">
              Galéria <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
    <Footer />
  </div>
);

export default EShopSuccess;
