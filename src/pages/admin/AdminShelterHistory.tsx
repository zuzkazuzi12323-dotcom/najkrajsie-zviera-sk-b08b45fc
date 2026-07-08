import { Trash2, MapPin, History as HistoryIcon } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Row = {
  id: string;
  shelter_id: string;
  period_start: string;
  period_end: string;
  collected_cents: number;
};

type Shelter = { id: string; name: string; city: string | null; logo_url: string | null };

const fmt = (d: string) => new Date(d).toLocaleDateString("sk");

const AdminShelterHistory = () => {
  const queryClient = useQueryClient();

  const { data: history = [] } = useQuery({
    queryKey: ["admin-shelter-history"],
    queryFn: async () => {
      const { data } = await supabase
        .from("shelter_support_history")
        .select("*")
        .order("period_end", { ascending: false });
      return (data || []) as Row[];
    },
  });

  const { data: shelters = [] } = useQuery({
    queryKey: ["admin-shelters-min"],
    queryFn: async () => {
      const { data } = await supabase.from("shelters").select("id, name, city, logo_url");
      return (data || []) as Shelter[];
    },
  });

  const shelterMap = new Map(shelters.map((s) => [s.id, s]));

  // Transparency aggregation per shelter
  const agg = new Map<string, { total: number; periods: number; first: string; last: string }>();
  history.forEach((h) => {
    const a = agg.get(h.shelter_id) || { total: 0, periods: 0, first: h.period_start, last: h.period_end };
    a.total += h.collected_cents;
    a.periods += 1;
    if (new Date(h.period_start) < new Date(a.first)) a.first = h.period_start;
    if (new Date(h.period_end) > new Date(a.last)) a.last = h.period_end;
    agg.set(h.shelter_id, a);
  });

  const remove = async (id: string) => {
    if (!confirm("Naozaj vymazať tento záznam histórie?")) return;
    const { error } = await supabase.from("shelter_support_history").delete().eq("id", id);
    if (error) return toast.error("Chyba pri mazaní");
    queryClient.invalidateQueries({ queryKey: ["admin-shelter-history"] });
    queryClient.invalidateQueries({ queryKey: ["shelter-history"] });
    toast.success("Záznam vymazaný");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl gradient-golden flex items-center justify-center">
          <HistoryIcon className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">História podporovaných útulkov</h1>
          <p className="text-sm text-muted-foreground">Uzavreté obdobia podpory a transparentnosť.</p>
        </div>
      </div>

      {/* Transparency summary */}
      <div className="bg-card rounded-2xl border border-border overflow-x-auto">
        <h3 className="font-semibold text-foreground p-4 border-b border-border">Transparentnosť podľa útulku</h3>
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="px-4 py-3">Útulok</th>
              <th className="px-4 py-3">Celkovo vyzbierané</th>
              <th className="px-4 py-3">Počet období</th>
              <th className="px-4 py-3">Prvá spolupráca</th>
              <th className="px-4 py-3">Posledná podpora</th>
            </tr>
          </thead>
          <tbody>
            {[...agg.entries()].map(([sid, a]) => {
              const s = shelterMap.get(sid);
              return (
                <tr key={sid} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{s?.name || "—"}</td>
                  <td className="px-4 py-3">{(a.total / 100).toFixed(2)} €</td>
                  <td className="px-4 py-3">{a.periods}</td>
                  <td className="px-4 py-3">{fmt(a.first)}</td>
                  <td className="px-4 py-3">{fmt(a.last)}</td>
                </tr>
              );
            })}
            {agg.size === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">Zatiaľ žiadne uzavreté obdobia.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Full history list */}
      <div className="bg-card rounded-2xl border border-border overflow-x-auto">
        <h3 className="font-semibold text-foreground p-4 border-b border-border">Všetky obdobia</h3>
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="px-4 py-3">Útulok</th>
              <th className="px-4 py-3">Obdobie</th>
              <th className="px-4 py-3">Vyzbierané</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {history.map((h) => {
              const s = shelterMap.get(h.shelter_id);
              return (
                <tr key={h.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      {s?.logo_url ? (
                        <img src={s.logo_url} alt="" className="w-8 h-8 rounded object-contain bg-white border border-border" />
                      ) : (
                        <div className="w-8 h-8 rounded bg-secondary" />
                      )}
                      <div>
                        <p>{s?.name || "—"}</p>
                        {s?.city && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> {s.city}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{fmt(h.period_start)} – {fmt(h.period_end)}</td>
                  <td className="px-4 py-3">{(h.collected_cents / 100).toFixed(2)} €</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => remove(h.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {history.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-6 text-center text-muted-foreground">Žiadne záznamy.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminShelterHistory;
