import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AnimatedNumber = ({ target }: { target: number }) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (target === 0) return;
    const duration = 1500;
    const steps = 60;
    const increment = target / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      if (step >= steps) {
        setCurrent(target);
        clearInterval(timer);
      } else {
        setCurrent(Math.round(increment * step));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);

  return <span className="tabular-nums">{(current / 100).toFixed(2)}</span>;
};

const DonationCounter = () => {
  const { data: totalDonated = 0 } = useQuery({
    queryKey: ["donation-total"],
    queryFn: async () => {
      const { data } = await supabase
        .from("payments")
        .select("amount")
        .eq("status", "completed");
      if (!data) return 0;
      const total = data.reduce((sum, p) => sum + p.amount, 0);
      return Math.round(total * 0.2);
    },
  });

  return (
    <section className="container mx-auto px-4 pb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl p-8 shadow-soft text-center border-2 border-primary/20"
      >
        <Heart className="w-10 h-10 text-primary fill-primary mx-auto mb-3" />
        <p className="text-2xl md:text-3xl font-bold text-foreground mb-1">
          Pre útulky sme zatiaľ vyzbierali: <AnimatedNumber target={totalDonated} /> € ❤️
        </p>
        <p className="text-muted-foreground max-w-xl mx-auto text-pretty">
          Každým nákupom alebo registráciou 1 € venujeme 20 % na podporu útulkov pre zvieratá ❤️ Pomôžte nám spolu naplniť cieľ a potešiť opustené zvieratá.
        </p>
      </motion.div>
    </section>
  );
};

export default DonationCounter;
