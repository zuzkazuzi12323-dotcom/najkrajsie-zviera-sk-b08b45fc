import { useState, useMemo } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DogCard from "@/components/DogCard";
import SponsorBanner from "@/components/SponsorBanner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Gallery = () => {
  const [search, setSearch] = useState("");
  const [selectedBreed, setSelectedBreed] = useState("Všetky");
  const [sortBy, setSortBy] = useState<"votes" | "name" | "newest">("votes");
  const { user } = useAuth();

  const { data: dogs = [] } = useQuery({
    queryKey: ["dogs"],
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data: dogsData } = await supabase.from("dogs").select("id,name,breed,age,description,image_url,highlighted,owner_id,boost_votes,archived,created_at").eq("approved", true);
      if (!dogsData) return [];

      const ownerIds = [...new Set(dogsData.map((d) => d.owner_id))];
      const [{ data: profiles }, { data: voteCounts }] = await Promise.all([
        supabase.from("profiles").select("user_id, display_name").in("user_id", ownerIds),
        supabase.from("votes").select("dog_id"),
      ]);
      const profileMap: Record<string, string> = {};
      profiles?.forEach((p) => { profileMap[p.user_id] = p.display_name || "Neznámy"; });
      const voteMap: Record<string, number> = {};
      voteCounts?.forEach((v) => { voteMap[v.dog_id] = (voteMap[v.dog_id] || 0) + 1; });

      return dogsData.map((d) => ({
        id: d.id, name: d.name, breed: d.breed, age: d.age,
        description: d.description, image_url: d.image_url,
        highlighted: d.highlighted, owner_name: profileMap[d.owner_id] || "Neznámy",
        votes: (voteMap[d.id] || 0) + ((d as any).boost_votes || 0),
        boost_votes: (d as any).boost_votes || 0,
        archived: (d as any).archived || false,
        created_at: d.created_at,
      }));
    },
  });

  const { data: userVotes = [] } = useQuery({
    queryKey: ["user-votes", user?.id],
    enabled: !!user,
    staleTime: 60 * 1000,
    queryFn: async () => {
      const { data } = await supabase.from("votes").select("dog_id").eq("user_id", user!.id);
      return data?.map((v) => v.dog_id) || [];
    },
  });

  const breeds = useMemo(() => ["Všetky", ...new Set(dogs.map((d) => d.breed))], [dogs]);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return dogs
      .filter((dog) => {
        const matchesSearch = !s || dog.name.toLowerCase().includes(s) || dog.breed.toLowerCase().includes(s);
        const matchesBreed = selectedBreed === "Všetky" || dog.breed === selectedBreed;
        return matchesSearch && matchesBreed;
      })
      .sort((a, b) => {
        if (sortBy === "votes") return b.votes - a.votes;
        if (sortBy === "name") return a.name.localeCompare(b.name);
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [dogs, search, selectedBreed, sortBy]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-2">Galéria psov</h1>
        <p className="text-muted-foreground mb-8">Hlasujte za svojho favorita alebo pridajte vlastného psa</p>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input type="text" placeholder="Hľadať podľa mena alebo plemena..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-shadow" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {breeds.map((breed) => (
              <button key={breed} onClick={() => setSelectedBreed(breed)}
                className={`px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedBreed === breed ? "gradient-golden text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}>
                {breed}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Zoradiť:</span>
          {(["votes", "name", "newest"] as const).map((s) => (
            <button key={s} onClick={() => setSortBy(s)}
              className={`text-sm px-3 py-1 rounded-full transition-colors ${sortBy === s ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>
              {s === "votes" ? "Najvíac hlasov" : s === "name" ? "Meno" : "Najnovšie"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((dog) => <DogCard key={dog.id} dog={dog} userVoted={userVotes.includes(dog.id)} />)}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">Žiadne výsledky pre vaše vyhľadávanie</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Gallery;
