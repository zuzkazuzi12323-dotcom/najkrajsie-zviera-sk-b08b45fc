import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, Eye, EyeOff, Trash2, UserX, UserCheck } from "lucide-react";

type Supporter = {
  id: string;
  name: string | null;
  is_anonymous: boolean;
  comment: string | null;
  show_comment: boolean;
  amount_cents: number;
  status: string;
  hidden: boolean;
  created_at: string;
};

const formatEur = (cents: number) => `${(cents / 100).toFixed(2).replace(".", ",")} €`;

const AdminSupporters = () => {
  const queryClient = useQueryClient();
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data: supporters = [], isLoading } = useQuery({
    queryKey: ["admin-supporters"],
    queryFn: async () => {
      const { data } = await supabase
        .from("platform_supporters")
        .select("*")
        .order("created_at", { ascending: false });
      return (data || []) as Supporter[];
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-supporters"] });
    queryClient.invalidateQueries({ queryKey: ["platform-supporters-public"] });
  };

  const update = async (id: string, payload: Partial<Supporter>) => {
    setBusyId(id);
    const { error } = await supabase.from("platform_supporters").update(payload).eq("id", id);
    if (error) toast.error("Nepodarilo sa uložiť");
    else invalidate();
    setBusyId(null);
  };

  const remove = async (id: string) => {
    if (!confirm("Naozaj odstrániť tento záznam?")) return;
    setBusyId(id);
    const { error } = await supabase.from("platform_supporters").delete().eq("id", id);
    if (error) toast.error("Nepodarilo sa odstrániť");
    else { toast.success("Odstránené"); invalidate(); }
    setBusyId(null);
  };

  const exportCsv = () => {
    const rows = [
      ["Meno", "Anonym", "Suma (€)", "Komentár", "Zobraziť komentár", "Skryté", "Stav", "Dátum"],
      ...supporters.map((s) => [
        s.name || "",
        s.is_anonymous ? "áno" : "nie",
        (s.amount_cents / 100).toFixed(2),
        (s.comment || "").replace(/"/g, '""'),
        s.show_comment ? "áno" : "nie",
        s.hidden ? "áno" : "nie",
        s.status,
        new Date(s.created_at).toLocaleString("sk-SK"),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `podporovatelia-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const total = supporters.filter((s) => s.status === "completed").reduce((sum, s) => sum + s.amount_cents, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Podporovatelia platformy</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Spolu vyzbierané: <strong className="text-primary">{formatEur(total)}</strong> · {supporters.length} záznamov
          </p>
        </div>
        <button onClick={exportCsv} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-foreground font-medium hover:bg-secondary/80">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Načítavam...</p>
      ) : supporters.length === 0 ? (
        <p className="text-muted-foreground">Zatiaľ žiadni podporovatelia.</p>
      ) : (
        <div className="space-y-3">
          {supporters.map((s) => (
            <div key={s.id} className={`bg-card border border-border rounded-xl p-4 ${s.hidden ? "opacity-60" : ""}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">
                    {s.is_anonymous ? "Anonym" : s.name || "—"}
                    {s.is_anonymous && s.name && <span className="text-xs text-muted-foreground ml-2">(skutočné: {s.name})</span>}
                  </p>
                  {s.comment && <p className="text-sm text-muted-foreground mt-1">„{s.comment}" {s.show_comment ? "" : "(skrytý)"}</p>}
                  <p className="text-xs text-muted-foreground mt-1">{new Date(s.created_at).toLocaleString("sk-SK")} · {s.status}</p>
                </div>
                <span className="font-bold text-primary">{formatEur(s.amount_cents)}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <button disabled={busyId === s.id} onClick={() => update(s.id, { hidden: !s.hidden })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-foreground text-xs font-medium hover:bg-secondary/80">
                  {s.hidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  {s.hidden ? "Zobraziť" : "Skryť"}
                </button>
                <button disabled={busyId === s.id} onClick={() => update(s.id, { is_anonymous: !s.is_anonymous })}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-foreground text-xs font-medium hover:bg-secondary/80">
                  {s.is_anonymous ? <UserCheck className="w-3.5 h-3.5" /> : <UserX className="w-3.5 h-3.5" />}
                  {s.is_anonymous ? "Zrušiť anonymitu" : "Anonymizovať"}
                </button>
                <button disabled={busyId === s.id} onClick={() => update(s.id, { show_comment: !s.show_comment })}
                  className="px-3 py-1.5 rounded-lg bg-secondary text-foreground text-xs font-medium hover:bg-secondary/80">
                  {s.show_comment ? "Skryť komentár" : "Zobraziť komentár"}
                </button>
                <button disabled={busyId === s.id} onClick={() => remove(s.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20">
                  <Trash2 className="w-3.5 h-3.5" /> Odstrániť
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSupporters;
