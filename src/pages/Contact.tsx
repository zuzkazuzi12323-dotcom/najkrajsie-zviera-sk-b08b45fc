import { motion } from "framer-motion";
import { Mail, Heart } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Contact = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="w-16 h-16 rounded-2xl gradient-golden flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Kontakt</h1>
          <p className="text-muted-foreground mb-8">Máte otázky alebo návrhy? Napíšte nám!</p>

          <div className="bg-card rounded-2xl p-8 shadow-elevated">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Heart className="w-5 h-5 text-primary fill-primary" />
              <span className="font-bold text-foreground">NajkrajšíPes.eu</span>
            </div>
            <a
              href="mailto:infonajkrajsipes@gmail.com"
              className="text-lg text-primary font-semibold hover:underline"
            >
              infonajkrajsipes@gmail.com
            </a>
            <p className="text-muted-foreground mt-4 text-sm">
              Odpovieme vám čo najskôr, zvyčajne do 24 hodín.
            </p>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
