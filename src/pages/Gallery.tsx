import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DogCard from "@/components/DogCard";
import { mockDogs } from "@/data/mockDogs";

const breeds = ["Všetky", ...new Set(mockDogs.map((d) => d.breed))];

const Gallery = () => {
  const [search, setSearch] = useState("");
  const [selectedBreed, setSelectedBreed] = useState("Všetky");
  const [sortBy, setSortBy] = useState<"votes" | "name" | "newest">("votes");

  const filtered = mockDogs
    .filter((dog) => {
      const matchesSearch =
        dog.name.toLowerCase().includes(search.toLowerCase()) ||
        dog.breed.toLowerCase().includes(search.toLowerCase());
      const matchesBreed = selectedBreed === "Všetky" || dog.breed === selectedBreed;
      return matchesSearch && matchesBreed;
    })
    .sort((a, b) => {
      if (sortBy === "votes") return b.votes - a.votes;
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-2">Galéria psov</h1>
        <p className="text-muted-foreground mb-8">Hlasujte za svojho favorita alebo pridajte vlastného psa</p>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Hľadať podľa mena alebo plemena..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {breeds.map((breed) => (
              <button
                key={breed}
                onClick={() => setSelectedBreed(breed)}
                className={`px-4 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedBreed === breed
                    ? "gradient-golden text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {breed}
              </button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 mb-6">
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Zoradiť:</span>
          {(["votes", "name", "newest"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`text-sm px-3 py-1 rounded-full transition-colors ${
                sortBy === s ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {s === "votes" ? "Najvíac hlasov" : s === "name" ? "Meno" : "Najnovšie"}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((dog) => (
            <DogCard key={dog.id} dog={dog} />
          ))}
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
