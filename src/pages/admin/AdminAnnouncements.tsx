import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Megaphone, Plus, Trash2, Eye, EyeOff, Info, AlertTriangle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Announcement } from "@/hooks/useAnnouncements";

const VARIANTS = [
  { value: "info", label: "Informácia", icon: Info },
  { value: "warning", label: "Upozornenie", icon: AlertTriangle },
  { value: "success", label: "Úspech", icon: CheckCircle2 },
];

const AdminAnnouncements = () => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("info");
  const [saving, setSaving] = useState(false);

  const { data: items = [] } = useQuery({
    queryKey: ["admin-announcements"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_announcements")
        .select("*")
        .order("created_at", { ascending: false });
      return (data || []) as unknown as Announcement[];
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
    queryClient.invalidateQueries({ queryKey: ["active-announcements"] });
  };

  const handleCreate = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Vyplňte nadpis aj text oznámenia");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("site_announcements").insert({
      title: title.trim(),
      message: message.trim(),
      variant,
      active: true,
    } as any);
    setSaving(false);
    if (error) {
      toast.error("Nepodarilo sa uložiť oznámenie");
      return;
    }
    setTitle("");
    setMessage("");
    setVariant("info");
    invalidate();
    toast.success("Oznámenie bolo zverejnené na stránke");
  };

  const toggleActive = async (a: Announcement) => {
    const { error } = await supabase
      .from("site_announcements")
      .update({ active: !a.active } as any)
      .eq("id", a.id);
    if (error) {
      toast.error("Chyba pri zmene stavu");
      return;
    }
    invalidate();
    toast.success(a.active ? "Oznámenie skryté" : "Oznámenie zverejnené");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Naozaj vymazať oznámenie?")) return;
    const { error } = await supabase.from("site_announcements").delete().eq("id", id);
    if (error) {
      toast.error("Chyba pri mazaní");
      return;
    }
    invalidate();
    toast.success("Oznámenie vymazané");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Megaphone className="w-6 h-6 text-primary" /> Upozornenia pre používateľov
        </h1>
        <p className="text-sm text-muted-foreground">
          Vytvorte vlastné oznámenie, ktoré sa zobrazí návštevníkom priamo na stránke. Celý text píšete ručne.
        </p>
      </div>

      {/* New announcement form */}
      <div className="bg-card rounded-2xl p-5 border border-border space-y-3">
        <h2 className="font-semibold text-foreground flex items-center gap-2"><Plus className="w-4 h-4" /> Nové oznámenie</h2>
        <div>
          <label className="text-sm font-medium text-foreground">Nadpis</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Napr. Dôležitá informácia pre používateľov"
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Text oznámenia</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Sem napíšte celý obsah oznámenia..."
            className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground">Typ</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {VARIANTS.map((v) => (
              <button
                key={v.value}
                onClick={() => setVariant(v.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border ${
                  variant === v.value ? "gradient-golden text-primary-foreground border-transparent" : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <v.icon className="w-4 h-4" /> {v.label}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={handleCreate}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium gradient-golden text-primary-foreground disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> Zverejniť oznámenie
        </button>
      </div>

      {/* Existing announcements */}
      <div className="space-y-3">
        <h2 className="font-semibold text-foreground">Zverejnené oznámenia</h2>
        {items.length === 0 ? (
          <div className="bg-card rounded-2xl p-8 text-center border border-border text-muted-foreground">
            Zatiaľ žiadne oznámenia.
          </div>
        ) : (
          items.map((a) => (
            <div key={a.id} className="bg-card rounded-2xl p-4 border border-border flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-foreground">{a.title}</h3>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${a.active ? "bg-green-100 text-green-800" : "bg-secondary text-muted-foreground"}`}>
                    {a.active ? "Zobrazené" : "Skryté"}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{a.message}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => toggleActive(a)} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground" title={a.active ? "Skryť" : "Zobraziť"}>
                  {a.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button onClick={() => handleDelete(a.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-destructive" title="Vymazať">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminAnnouncements;
