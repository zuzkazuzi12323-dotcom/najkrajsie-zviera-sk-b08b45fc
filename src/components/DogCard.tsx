import { Heart, Award } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

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
  };
  userVoted?: boolean;
}

const DogCard = ({ dog, userVoted = false }: DogCardProps) => {
  const [votes, setVotes] = useState(dog.votes);
  const [voted, setVoted] = useState(userVoted);
  const { user } = useAuth();

  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }}
        className={`group relative bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-elevated transition-shadow duration-300 ${dog.highlighted ? "ring-2 ring-primary" : ""}`}>
        <div className="relative aspect-[3/4] overflow-hidden rounded-t-2xl">
          <img src={dog.image_url} alt={dog.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 gradient-hero opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <motion.button onClick={handleVote} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className={`absolute bottom-4 right-4 flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm shadow-lg transition-all duration-300 ${
              voted ? "bg-primary text-primary-foreground" : "bg-card/90 backdrop-blur-sm text-foreground hover:bg-primary hover:text-primary-foreground"
            } opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0`}>
            <Heart className={`w-4 h-4 ${voted ? "fill-current" : ""}`} />
            <span className="tabular-nums">{votes}</span>
          </motion.button>
          {dog.highlighted && (
            <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-golden">
              <Award className="w-3.5 h-3.5" /> Top Kandidát
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-bold text-card-foreground">{dog.name}</h3>
          <p className="text-sm text-muted-foreground">{dog.breed} · {dog.age}</p>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Heart className={`w-4 h-4 ${voted ? "text-primary fill-primary" : ""}`} />
              <span className="tabular-nums font-medium">{votes} hlasov</span>
            </div>
            <span className="text-xs text-muted-foreground">{dog.owner_name}</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default DogCard;
