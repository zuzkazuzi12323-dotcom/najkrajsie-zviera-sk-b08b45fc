import { Heart, Award, Rocket } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useContestActive } from "@/hooks/useContestActive";

interface DogCardProps {
  dog: {
    id: string;
    name: string;
    breed: string;
    age: string;
    image_url: string;
    highlighted: boolean;
    owner_name?: string | null;
    votes: number;
    boost_votes?: number;
  };
  userVoted?: boolean;
}

const DogCard = ({ dog, userVoted = false }: DogCardProps) => {
  const [votes, setVotes] = useState(dog.votes);
  const [voted, setVoted] = useState(userVoted);
  const { user } = useAuth();
  const contestActive = useContestActive();

  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!contestActive) { toast.error("Súťaž je momentálne ukončená"); return; }
    if (!user) { toast.error("Pre hlasovanie sa musíte prihlásiť"); return; }
    if (voted) {
      await supabase.from("votes").delete().eq("user_id", user.id).eq("dog_id", dog.id);
      setVotes((v) => v - 1); setVoted(false); toast.info("Hlas bol odobratý");
    } else {
      const { error } = await supabase.from("votes").insert({ user_id: user.id, dog_id: dog.id });
      if (error) { toast.error("Nepodarilo sa hlasovať"); return; }
      setVotes((v) => v + 1); setVoted(true); toast.success("Hlas započítaný! 🐾");
    }
  };

  return (
    <Link to={`/pes/${dog.id}`}>
      <div
        className={`group relative bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 ${dog.highlighted ? "ring-2 ring-primary" : ""}`}>
        <div className="relative aspect-square overflow-hidden rounded-t-2xl">
          <img src={dog.image_url} alt={dog.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
          <div className="absolute inset-0 gradient-hero opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <button onClick={handleVote}
            className={`absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-2 rounded-full font-semibold text-xs shadow-lg transition-all duration-300 active:scale-95 ${
              voted ? "bg-primary text-primary-foreground" : "bg-card/90 backdrop-blur-sm text-foreground hover:bg-primary hover:text-primary-foreground"
            } opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0`}>
            <Heart className={`w-3.5 h-3.5 ${voted ? "fill-current" : ""}`} />
            <span className="tabular-nums">{votes}</span>
          </button>
          {dog.highlighted && (
            <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-semibold shadow-golden">
              <Award className="w-3 h-3" /> Top
            </div>
          )}
          {(dog.boost_votes || 0) > 0 && (
            <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[10px] font-semibold shadow-lg">
              <Rocket className="w-3 h-3" /> Boost
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="text-sm font-bold text-card-foreground truncate">{dog.name}</h3>
          <p className="text-xs text-muted-foreground truncate">{dog.breed} · {dog.age}</p>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Heart className={`w-3 h-3 ${voted ? "text-primary fill-primary" : ""}`} />
              <span className="tabular-nums font-medium">{votes}</span>
            </div>
            <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">{dog.owner_name}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default DogCard;
