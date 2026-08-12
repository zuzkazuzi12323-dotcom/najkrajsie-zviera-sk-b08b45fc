import { useState, useMemo } from "react";
import { Search, Archive as ArchiveIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DogCard from "@/components/DogCard";
import { supabase } from "@/integrations/supabase/client";

const Archive = () => {
  const [search, setSearch] = useState("");

  const { data: dogs = [], isLoading } = useQuery({
    queryKey: ["archived-dogs"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data: dogsData } = await supabase
        .from("dogs")
        .select("id,name,breed,age,image_url,highlighted,owner_id,archived,created_at")
        .eq("approved", true)
        .eq("archived", true)
        .order("created_at", { ascending: false });
      if (!dogsData) return [];

      const ownerIds = [...new Set(dogsData.map((d) => d.owner_id))];
      const [{ data: profiles }, { data: voteCounts }] = await Promise.all([
        supabase.from("profiles_public").select("user_id, display_name").in("user_id", ownerIds),
        supabase.from("votes").select("dog_id"),
      ]);
      const profileMap: Record<string, string> = {};
      profiles?.forEach((p) => { profileMap[p.user_id] = p.display_name || "Neznámy"; });
      const voteMap: Record<string, number> = {};
      voteCounts?.forEach((v) => { voteMap[v.dog_id] = (voteMap[v.dog_id] || 0) + 1; });

      return dogsData.map((d) => ({
        id: d.id, name: d.name, breed: d.breed, age: d.age,
        image_url: d.image_url, highlighted: d.highlighted,
        owner_name: profileMap[d.owner_id] || "Neznámy",
        votes: voteMap[d.id] || 0,
        archived: true,
      }));
    },
  });

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return dogs.filter((d) => !s || d.name.toLowerCase().includes(s) || d.breed.toLowerCase().includes(s));
  }, [dogs, search]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center gap-2 mb-2">
          <ArchiveIcon className="w-6 h-6 text-muted-foreground" />
          <h1 className="text-3xl md:text-5xl font-bold text-foreground">Archív súťaže</h1>
        </div>
        <p className="text-muted-foreground mb-6 max-w-2xl">
          Psi, ktorí už súťažili v predchádzajúcich kolách. Ich profily zostávajú zachované ako spomienka,
          ale už za nich nie je možné hlasovať a v aktuálnej súťaži sa nezobrazujú.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Hľadať v archíve..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <Link to="/galeria" className="inline-flex items-center justify-center px-5 py-3 rounded-xl gradient-golden text-primary-foreground font-semibold text-sm">
            Aktuálna súťaž
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((dog) => <DogCard key={dog.id} dog={dog} />)}
        </div>

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              {dogs.length === 0 ? "Archív je zatiaľ prázdny — žiadne ukončené kolo súťaže." : "Žiadne výsledky pre vaše vyhľadávanie"}
            </p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Archive;
