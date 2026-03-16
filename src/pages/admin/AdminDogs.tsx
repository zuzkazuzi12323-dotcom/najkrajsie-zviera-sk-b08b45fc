import { useState } from "react";
import { Trash2, Search, Award } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminDogs = () => {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: dogs = [] } = useQuery({
    queryKey: ["admin-dogs"],
    queryFn: async () => {
      const { data: dogsData } = await supabase
        .from("dogs")
        .select("*, profiles!dogs_owner_id_fkey(display_name)")
        .order("created_at", { ascending: false });
      
      if (!dogsData) return [];

      const { data: voteCounts } = await supabase.from("votes").select("dog_id");
      const voteMap: Record<string, number> = {};
      voteCounts?.forEach((v) => { voteMap[v.dog_id] = (voteMap[v.dog_id] || 0) + 1; });

      return dogsData.map((d) => ({
        ...d,
        owner_name: (d.profiles as any)?.display_name || "Neznámy",
        votes: voteMap[d.id] || 0,
      }));
    },
  });

  const filtered = dogs.filter(
    (d) => d.name.toLowerCase().includes(search.toLowerCase()) || d.breed.toLowerCase().includes(search.toLowerCase())
  );

  const deleteDog = async (id: string) => {
    const { error } = await supabase.from("dogs").delete().eq("id", id);
    if (error) {
      toast.error("Nepodarilo sa vymazať psa");
    } else {
      toast.success("Pes bol vymazaný");
      queryClient.invalidateQueries({ queryKey: ["admin-dogs"] });
    }
  };

  const toggleHighlight = async (id: string, current: boolean) => {
    const { error } = await supabase.from("dogs").update({ highlighted: !current }).eq("id", id);
    if (error) {
      toast.error("Nepodarilo sa zmeniť zvýraznenie");
    } else {
      toast.success("Zvýraznenie zmenené");
      queryClient.invalidateQueries({ queryKey: ["admin-dogs"] });
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Hľadať psa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
      </div>

      <div className="bg-card rounded-2xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Fotka</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Meno</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Plemeno</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Hlasy</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Majiteľ</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Akcie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((dog) => (
                <tr key={dog.id} className="group hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-3">
                    <img src={dog.image_url} alt={dog.name} className="w-10 h-10 rounded-lg object-cover" />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{dog.name}</span>
                      {dog.highlighted && <Award className="w-4 h-4 text-primary" />}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{dog.breed}</td>
                  <td className="px-5 py-3 text-sm tabular-nums font-medium text-foreground">{dog.votes}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{dog.owner_name}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => toggleHighlight(dog.id, dog.highlighted)}
                        className={`p-2 rounded-lg hover:bg-secondary ${dog.highlighted ? "text-primary" : "text-muted-foreground"}`}
                        title="Zvýrazniť"
                      >
                        <Award className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteDog(dog.id)}
                        className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                        title="Vymazať"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDogs;
