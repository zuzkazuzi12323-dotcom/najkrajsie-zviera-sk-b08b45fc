import { motion } from "framer-motion";
import { Trophy, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

const Winners = () => {
  const { data: topDogs = [] } = useQuery({
    queryKey: ["winners"],
    queryFn: async () => {
      const { data: dogsData } = await supabase
        .from("dogs")
        .select("*")
        .eq("is_winner", true);
      if (!dogsData || dogsData.length === 0) return [];

      const { data: voteCounts } = await supabase.from("votes").select("dog_id");
      const voteMap: Record<string, number> = {};
      voteCounts?.forEach((v) => { voteMap[v.dog_id] = (voteMap[v.dog_id] || 0) + 1; });

      return dogsData
        .map((d: any) => ({ ...d, votes: voteMap[d.id] || 0 }))
        .sort((a: any, b: any) => (a.winner_place || 99) - (b.winner_place || 99));
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-10">
            <Trophy className="w-12 h-12 text-primary mx-auto mb-3" />
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Víťazi súťaže</h1>
            <p className="text-muted-foreground mt-2">Najobľúbenejší psy podľa počtu hlasov</p>
          </div>

          {topDogs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {topDogs.map((dog, i) => (
                <motion.div
                  key={dog.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`bg-card rounded-2xl overflow-hidden shadow-elevated ${i === 0 ? "ring-2 ring-primary sm:col-span-2 lg:col-span-1" : ""}`}
                >
                  <div className="relative aspect-square overflow-hidden">
                    <img src={dog.image_url} alt={dog.name} className="w-full h-full object-cover" />
                    {i === 0 && (
                      <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full gradient-golden text-primary-foreground text-xs font-bold shadow-golden flex items-center gap-1">
                        <Trophy className="w-3.5 h-3.5" /> 1. miesto
                      </div>
                    )}
                    {i === 1 && (
                      <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-bold">
                        2. miesto
                      </div>
                    )}
                    {i === 2 && (
                      <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-bold">
                        3. miesto
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-card-foreground">{dog.name}</h3>
                    <p className="text-sm text-muted-foreground">{dog.breed} · {dog.age}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm font-semibold text-primary">{dog.votes} hlasov</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(dog.created_at).toLocaleDateString("sk")}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-16">Zatiaľ žiadni víťazi.</p>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Winners;
