import { Link } from "react-router-dom";
import { Trophy } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const medal = (p: number | null) => (p === 1 ? "🥇" : p === 2 ? "🥈" : p === 3 ? "🥉" : `${p ?? ""}.`);

const WinnersSection = () => {
  const { data: winners = [] } = useQuery({
    queryKey: ["public-winners"],
    staleTime: 2 * 60 * 1000,
    queryFn: async () => {
      const { data: dogs } = await supabase
        .from("dogs")
        .select("id,name,breed,image_url,winner_place,boost_votes")
        .eq("is_winner", true)
        .order("winner_place", { ascending: true });
      if (!dogs?.length) return [];
      const { data: votes } = await supabase.from("votes").select("dog_id").in("dog_id", dogs.map((d) => d.id));
      const m: Record<string, number> = {};
      votes?.forEach((v) => (m[v.dog_id] = (m[v.dog_id] || 0) + 1));
      return dogs.map((d) => ({ ...d, total: (m[d.id] || 0) + (d.boost_votes || 0) }));
    },
  });

  if (!winners.length) return null;

  return (
    <section className="mb-10 rounded-2xl border border-primary/30 bg-primary/5 p-5 md:p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          <Trophy className="w-6 h-6 text-primary" /> Víťazi súťaže
        </h2>
        <Link to="/vitazi" className="text-sm font-semibold text-primary hover:underline">Všetci víťazi →</Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {winners.map((w) => (
          <Link key={w.id} to={`/pes/${w.id}`} className="rounded-xl bg-card border border-border overflow-hidden hover:shadow-lg transition-shadow">
            <img src={w.image_url} alt={w.name} className="w-full aspect-square object-cover" loading="lazy" />
            <div className="p-3">
              <div className="text-lg font-bold text-foreground">{medal(w.winner_place)} {w.name}</div>
              <div className="text-sm text-muted-foreground">{w.breed}</div>
              <div className="text-sm font-semibold text-primary mt-1">{w.total} hlasov</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default WinnersSection;
