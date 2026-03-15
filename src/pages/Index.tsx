import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Users, Trophy, ArrowRight } from "lucide-react";
import heroImg from "@/assets/hero-dog.jpg";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DogCard from "@/components/DogCard";
import { mockDogs } from "@/data/mockDogs";

const stats = [
  { icon: Heart, label: "Hlasov dnes", value: "1,248" },
  { icon: Users, label: "Súťažiacich psov", value: "486" },
  { icon: Trophy, label: "Aktívnych súťaží", value: "3" },
];

const Index = () => {
  const topDogs = [...mockDogs].sort((a, b) => b.votes - a.votes).slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Krásny pes" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
        </div>
        <div className="relative container mx-auto px-4 py-24 md:py-40">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-xl"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-background mb-6">
              Ktorý pes si dnes získa vaše srdce?
            </h1>
            <p className="text-lg md:text-xl text-background/80 mb-8 text-pretty">
              Pridajte svojho miláčika do súťaže a získajte hlasy od tisícov milovníkov psov po celom Slovensku.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/galeria">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  className="gradient-golden text-primary-foreground px-8 py-4 rounded-full font-bold shadow-golden flex items-center gap-2 text-lg"
                >
                  Preskúmať galériu
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <Link to="/pridat">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-background/20 backdrop-blur-sm text-background border border-background/30 px-8 py-4 rounded-full font-bold flex items-center gap-2 text-lg hover:bg-background/30 transition-colors"
                >
                  Pridať psa
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="bg-card rounded-2xl p-6 shadow-elevated flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl gradient-golden flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums text-card-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Top Dogs */}
      <section className="container mx-auto px-4 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Najobľúbenejší psy</h2>
            <p className="text-muted-foreground mt-2">Títo psy majú najviac hlasov v aktuálnej súťaži</p>
          </div>
          <Link
            to="/galeria"
            className="hidden md:flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
          >
            Zobraziť všetkých <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {topDogs.map((dog) => (
            <DogCard key={dog.id} dog={dog} />
          ))}
        </div>
        <Link
          to="/galeria"
          className="md:hidden flex items-center justify-center gap-2 mt-8 text-primary font-semibold"
        >
          Zobraziť všetkých <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 pb-20">
        <div className="gradient-golden rounded-3xl p-10 md:p-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            Zapojiť sa do súťaže
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto text-pretty">
            Pridajte profil vášho psa za pouhý 1 € a získajte šancu vyhrať titul Najkrajší pes Slovenska.
          </p>
          <Link to="/pridat">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.95 }}
              className="bg-card text-card-foreground px-8 py-4 rounded-full font-bold shadow-elevated text-lg hover:shadow-golden transition-shadow"
            >
              Pridať psa za 1 €
            </motion.button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
