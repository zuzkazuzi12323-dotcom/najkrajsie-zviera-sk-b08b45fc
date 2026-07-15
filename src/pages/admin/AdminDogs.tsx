import { useState } from "react";
import { Trash2, Search, Award, CheckCircle, XCircle, Archive, ArchiveRestore, Trophy } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminDogs = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "archived">("all");
  const queryClient = useQueryClient();

  const { data: dogs = [] } = useQuery({
    queryKey: ["admin-dogs"],
    queryFn: async () => {
      const { data: dogsData } = await supabase.from("dogs").select("*").order("created_at", { ascending: false });
      if (!dogsData) return [];

      const ownerIds = [...new Set(dogsData.map((d) => d.owner_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name").in("user_id", ownerIds);
      const profileMap: Record<string, string> = {};
      profiles?.forEach((p) => { profileMap[p.user_id] = p.display_name || "Neznámy"; });

      const { data: voteCounts } = await supabase.from("votes").select("dog_id");
      const voteMap: Record<string, number> = {};
      voteCounts?.forEach((v) => { voteMap[v.dog_id] = (voteMap[v.dog_id] || 0) + 1; });

      return dogsData.map((d) => ({
        ...d,
        owner_name: profileMap[d.owner_id] || "Neznámy",
        votes: voteMap[d.id] || 0,
      }));
    },
  });

  const filtered = dogs
    .filter((d) => d.name.toLowerCase().includes(search.toLowerCase()) || d.breed.toLowerCase().includes(search.toLowerCase()))
    .filter((d) => filter === "all" ? true : filter === "approved" ? d.approved && !d.archived : filter === "archived" ? d.archived : !d.approved);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-dogs"] });

  const approveDog = async (id: string) => {
    const { error } = await supabase.from("dogs").update({ approved: true }).eq("id", id);
    if (error) toast.error("Chyba"); else { toast.success("Pes schválený ✅"); invalidate(); }
  };

  const rejectDog = async (id: string) => {
    const { error } = await supabase.from("dogs").update({ approved: false }).eq("id", id);
    if (error) toast.error("Chyba"); else { toast.success("Pes zamietnutý"); invalidate(); }
  };

  const deleteDog = async (id: string) => {
    if (!confirm("Naozaj chcete vymazať tohto psa?")) return;
    await supabase.from("votes").delete().eq("dog_id", id);
    await supabase.from("comments").delete().eq("dog_id", id);
    const { error } = await supabase.from("dogs").delete().eq("id", id);
    if (error) toast.error("Nepodarilo sa vymazať psa");
    else { toast.success("Pes bol vymazaný"); invalidate(); }
  };

  const toggleHighlight = async (id: string, current: boolean) => {
    const { error } = await supabase.from("dogs").update({ highlighted: !current }).eq("id", id);
    if (error) toast.error("Chyba"); else { toast.success(current ? "Zvýraznenie zrušené" : "Pes označený ako Top 🌟"); invalidate(); }
  };

  // boost feature removed

  const toggleArchive = async (id: string, archived: boolean) => {
    const { error } = await supabase.from("dogs").update({ archived: !archived }).eq("id", id);
    if (error) toast.error("Chyba"); else { toast.success(archived ? "Pes obnovený do súťaže" : "Pes archivovaný (bez hlasov)"); invalidate(); }
  };

  const setWinner = async (id: string, isWinner: boolean) => {
    if (isWinner) {
      const { error } = await supabase.from("dogs").update({ is_winner: false, winner_place: null }).eq("id", id);
      if (error) toast.error("Chyba"); else { toast.success("Označenie víťaza zrušené"); invalidate(); }
      return;
    }
    const placeStr = prompt("Umiestnenie víťaza (1, 2, 3...)", "1");
    const place = parseInt(placeStr || "0");
    if (!place || place < 1) return;
    const { error } = await supabase.from("dogs").update({ is_winner: true, winner_place: place }).eq("id", id);
    if (error) { toast.error("Chyba"); return; }
    toast.success(`Označený ako víťaz – ${place}. miesto 🏆 Posielam email...`);
    invalidate();
    // Send winner notification email (fire-and-forget)
    supabase.functions.invoke("send-winner-email", { body: { dogId: id, place } })
      .then(({ data, error: fnErr }) => {
        if (fnErr || !(data as any)?.success) {
          toast.error("Email víťazovi sa nepodarilo odoslať");
          console.error("winner email failed", fnErr, data);
        } else {
          toast.success("Email víťazovi odoslaný ✉️");
        }
      });
  };

  const archiveAllApproved = async () => {
    const eligible = dogs.filter((d) => d.approved && !d.archived);
    if (eligible.length === 0) { toast.info("Niet koho archivovať"); return; }
    if (!confirm(`Archivovať ${eligible.length} schválených psov? Zostanú v galérii bez možnosti hlasovania.`)) return;
    const ids = eligible.map((d) => d.id);
    const { error } = await supabase.from("dogs").update({ archived: true }).in("id", ids);
    if (error) toast.error("Chyba"); else { toast.success(`Archivovaných ${ids.length} psov`); invalidate(); }
  };

  const filters: { key: typeof filter; label: string }[] = [
    { key: "all", label: `Všetci (${dogs.length})` },
    { key: "pending", label: `Nezaplatené (${dogs.filter(d => !d.approved).length})` },
    { key: "approved", label: `Schválení (${dogs.filter(d => d.approved && !d.archived).length})` },
    { key: "archived", label: `Archivovaní (${dogs.filter(d => d.archived).length})` },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-800">
        ℹ️ Psy sa do súťaže pridávajú automaticky <strong>až po úhrade</strong> registračného poplatku <strong>2,99 €</strong>.
        20 % z každej registrácie ide útulkom. Manuálne schvaľovanie nie je potrebné.
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Hľadať psa..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
        </div>
        <div className="flex flex-wrap gap-1">
          {filters.map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${filter === f.key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}>
              {f.label}
            </button>
          ))}
        </div>
        <button
          onClick={archiveAllApproved}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 text-xs font-semibold"
          title="Archivovať všetkých schválených (po skončení ročníka)"
        >
          <Archive className="w-4 h-4" /> Archivovať všetkých
        </button>
      </div>

      <div className="bg-card rounded-2xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Fotka</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Meno</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Plemeno</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Hlasy</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Stav</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Majiteľ</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase">Akcie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((dog) => (
                <tr key={dog.id} className="group hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3"><img src={dog.image_url} alt={dog.name} className="w-10 h-10 rounded-lg object-cover" /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{dog.name}</span>
                      {dog.highlighted && <Award className="w-4 h-4 text-primary" />}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{dog.breed}</td>
                  <td className="px-4 py-3 text-sm tabular-nums font-medium text-foreground">{dog.votes}</td>
                  <td className="px-4 py-3">
                    {dog.archived ? (
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-200 text-gray-700">Archivovaný</span>
                    ) : (
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${dog.approved ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {dog.approved ? "Zaplatený" : "Nezaplatený"}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{dog.owner_name}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {!dog.approved && (
                        <button onClick={() => approveDog(dog.id)} className="p-1.5 rounded-lg hover:bg-green-100 text-green-600" title="Schváliť">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      {dog.approved && (
                        <button onClick={() => rejectDog(dog.id)} className="p-1.5 rounded-lg hover:bg-yellow-100 text-yellow-600" title="Zamietnuť">
                          <XCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => toggleHighlight(dog.id, dog.highlighted)} className={`p-1.5 rounded-lg hover:bg-secondary ${dog.highlighted ? "text-primary" : "text-muted-foreground"}`} title="Top pes">
                        <Award className="w-4 h-4" />
                      </button>
                      <button onClick={() => toggleArchive(dog.id, dog.archived)} className={`p-1.5 rounded-lg hover:bg-amber-100 ${dog.archived ? "text-amber-700" : "text-muted-foreground"}`} title={dog.archived ? "Obnoviť do súťaže" : "Archivovať (bez hlasov)"}>
                        {dog.archived ? <ArchiveRestore className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                      </button>
                      <button onClick={() => setWinner(dog.id, (dog as any).is_winner)} className={`p-1.5 rounded-lg hover:bg-yellow-100 ${(dog as any).is_winner ? "text-yellow-600" : "text-muted-foreground"}`} title={(dog as any).is_winner ? `Víťaz – ${(dog as any).winner_place}. miesto (klikni pre zrušenie)` : "Označiť ako víťaza"}>
                        <Trophy className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteDog(dog.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive" title="Vymazať">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <p className="text-center py-10 text-muted-foreground">Žiadni psy</p>}
      </div>
    </div>
  );
};

export default AdminDogs;
