import { Link } from "react-router-dom";
import { Heart, MapPin, PawPrint } from "lucide-react";
import { motion } from "framer-motion";
import { useFeaturedShelter } from "@/hooks/useShelters";

/** Prominent homepage section highlighting the currently supported shelter. */
const FeaturedShelterSection = () => {
  const { data: shelter } = useFeaturedShelter();

  if (!shelter) return null;

  const collected = (shelter.collected_cents || 0) / 100;
  const goal = (shelter.goal_cents || 0) / 100;
  const pct = goal > 0 ? Math.min(100, Math.round((collected / goal) * 100)) : 0;

  return (
    <section className="container mx-auto px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 shadow-elevated max-w-4xl mx-auto"
      >
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-primary/10 blur-2xl" />
        <div className="relative p-6 md:p-10">
          <div className="flex items-center justify-center gap-2 mb-6">
            <PawPrint className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-primary uppercase tracking-wider">
              Aktuálne podporovaný útulok
            </span>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
            <div className="w-40 h-40 shrink-0 bg-white rounded-2xl border border-border shadow-soft flex items-center justify-center p-4">
              {shelter.logo_url ? (
                <img
                  src={shelter.logo_url}
                  alt={shelter.name}
                  className="max-w-full max-h-full object-contain"
                  loading="lazy"
                />
              ) : (
                <Heart className="w-16 h-16 text-primary/40 fill-primary/20" />
              )}
            </div>

            <div className="flex-1 text-center md:text-left w-full">
              <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">{shelter.name}</h2>
              {shelter.city && (
                <p className="text-muted-foreground mt-1 flex items-center gap-1 justify-center md:justify-start">
                  <MapPin className="w-4 h-4" /> {shelter.city}
                </p>
              )}
              {shelter.description && (
                <p className="text-muted-foreground mt-3 text-pretty line-clamp-3">{shelter.description}</p>
              )}

              {goal > 0 && (
                <div className="mt-5">
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="font-semibold text-foreground">{collected.toFixed(2)} €</span>
                    <span className="text-muted-foreground">Cieľ: {goal.toFixed(2)} €</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-secondary overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-600"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{pct} % z cieľa zbierky</p>
                </div>
              )}

              <Link
                to={`/utulok/${shelter.id}`}
                className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:scale-105 active:scale-95 transition-transform"
              >
                <Heart className="w-5 h-5 fill-white" /> Podporiť útulok
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default FeaturedShelterSection;
