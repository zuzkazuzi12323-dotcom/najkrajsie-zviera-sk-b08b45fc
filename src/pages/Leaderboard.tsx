import { Link } from "react-router-dom";
import { Trophy, Heart, Rocket, Medal, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

const Leaderboard = () => {
  const { data: dogs = [], isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data: dogsData } = await supabase.from("dogs").select("*").eq("approved", true).eq("archived", false);
      if (!dogsData) return [];

      const { data: voteCounts } = await supabase.from("votes").select("dog_id");
      const voteMap: Record<string, number> = {};
      voteCounts?.forEach((v) => { voteMap[v.dog_id] = (voteMap[v.dog_id] || 0) + 1; });

      return dogsData
        .map((d) => ({
          id: d.id,
          name: d.name,
          breed: d.breed,
          image_url: d.image_url,
          votes: voteMap[d.id] || 0,
          boost_votes: d.boost_votes || 0,
          total: (voteMap[d.id] || 0) + (d.boost_votes || 0),
          highlighted: d.highlighted,
        }))
        .sort((a, b) => b.total - a.total);
    },
  });

  const getMedalColor = (i: number) => {
    if (i === 0) return "from-yellow-400 to-amber-500";
    if (i === 1) return "from-gray-300 to-gray-400";
    if (i === 2) return "from-amber-600 to-amber-700";
    return "";
  };

  const getMedalEmoji = (i: number) => {
    if (i === 0) return "🥇";
    if (i === 1) return "🥈";
    if (i === 2) return "🥉";
    return `${i + 1}.`;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            <TrendingUp className="w-4 h-4" /> Aktuálny rebríček
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-foreground mb-2">🏆 Rebríček TOP psov</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Pozrite sa, kto vedie v hlasovaní. Podporite svojho favorita hlasovaním alebo boost balíčkom!
          </p>
        </motion.div>

        {isLoading ? (
          <p className="text-center text-muted-foreground py-16">Načítavam rebríček...</p>
        ) : dogs.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">Zatiaľ žiadni psy v súťaži.</p>
        ) : (
          <>
            {/* Top 3 podium */}
            {dogs.length >= 3 && (
              <div className="flex items-end justify-center gap-3 mb-12 max-w-2xl mx-auto">
                {[1, 0, 2].map((pos) => {
                  const dog = dogs[pos];
                  if (!dog) return null;
                  const isFirst = pos === 0;
                  return (
                    <motion.div
                      key={dog.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: pos * 0.15 }}
                      className={`flex flex-col items-center ${isFirst ? "order-2" : pos === 1 ? "order-1" : "order-3"}`}
                    >
                      <Link to={`/pes/${dog.id}`}>
                        <div className={`relative ${isFirst ? "w-28 h-28 md:w-36 md:h-36" : "w-20 h-20 md:w-28 md:h-28"}`}>
                          <img src={dog.image_url} alt={dog.name}
                            className={`w-full h-full rounded-full object-cover border-4 ${
                              isFirst ? "border-yellow-400 shadow-golden" : pos === 1 ? "border-gray-300" : "border-amber-600"
                            }`} />
                          <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-b ${getMedalColor(pos)} flex items-center justify-center text-white text-sm font-bold shadow-lg`}>
                            {pos + 1}
                          </div>
                        </div>
                      </Link>
                      <p className="font-bold text-foreground mt-3 text-sm md:text-base">{dog.name}</p>
                      <p className="text-xs text-muted-foreground">{dog.breed}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Heart className="w-3.5 h-3.5 text-primary fill-primary" />
                        <span className="text-sm font-bold tabular-nums text-foreground">{dog.total}</span>
                      </div>
                      <div className={`mt-2 rounded-t-lg bg-gradient-to-b ${getMedalColor(pos)} ${
                        isFirst ? "h-28 w-24 md:w-32" : pos === 1 ? "h-20 w-20 md:w-28" : "h-14 w-20 md:w-28"
                      } opacity-20 rounded-t-xl`} />
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Full list */}
            <div className="bg-card rounded-2xl shadow-soft overflow-hidden max-w-3xl mx-auto">
              <div className="p-5 border-b border-border">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <Medal className="w-5 h-5 text-primary" /> Kompletný rebríček ({dogs.length} psov)
                </h3>
              </div>
              <div className="divide-y divide-border">
                {dogs.map((dog, i) => (
                  <Link key={dog.id} to={`/pes/${dog.id}`}
                    className="flex items-center gap-4 px-5 py-3 hover:bg-secondary/30 transition-colors">
                    <span className={`w-8 text-center font-bold tabular-nums ${
                      i < 3 ? "text-lg" : "text-sm text-muted-foreground"
                    }`}>
                      {getMedalEmoji(i)}
                    </span>
                    <img src={dog.image_url} alt={dog.name} className="w-10 h-10 rounded-full object-cover border-2 border-border" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{dog.name}</p>
                      <p className="text-xs text-muted-foreground">{dog.breed}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {dog.boost_votes > 0 && (
                        <span className="flex items-center gap-1 text-xs text-purple-600">
                          <Rocket className="w-3.5 h-3.5" /> {dog.boost_votes}
                        </span>
                      )}
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4 text-primary fill-primary" />
                        <span className="font-bold tabular-nums text-foreground">{dog.total}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Leaderboard;
