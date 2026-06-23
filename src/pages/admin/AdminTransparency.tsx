import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Trash2, Eye, EyeOff, Upload, X, Pencil } from "lucide-react";

type Category = "shelter" | "sponsor" | "user_gift";

type Record = {
  id: string;
  category: Category;
  title: string;
  description: string | null;
  shelter_name: string | null;
  donor_name: string | null;
  amount_cents: number | null;
  image_url: string | null;
  record_date: string;
  published: boolean;
  display_order: number;
};

const CATEGORY_LABELS: { value: Category; label: string }[] = [
  { value: "shelter", label: "Útulok (finančný dar)" },
  { value: "sponsor", label: "Sponzor (firemný dar)" },
  { value: "user_gift", label: "Používateľský dar" },
];

const empty = {
  category: "shelter" as Category,
  title: "",
  description: "",
  shelter_name: "",
  donor_name: "",
  amount: "",
  image_url: "",
  record_date: new Date().toISOString().slice(0, 10),
  published: true,
};

const AdminTransparency = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ ...empty });
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["admin-transparency"],
    queryFn: async () => {
      const { data } = await supabase
        .from("transparency_records")
        .select("*")
        .order("record_date", { ascending: false });
      return (data || []) as Record[];
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-transparency"] });
    queryClient.invalidateQueries({ queryKey: ["transparency-records"] });
  };

  const resetForm = () => { setForm({ ...empty }); setEditId(null); setShowForm(false); };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `transparency/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("dog-images").upload(path, file, { upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from("dog-images").getPublicUrl(path);
      setForm((f) => ({ ...f, image_url: data.publicUrl }));
      toast.success("Obrázok nahraný");
    } catch {
      toast.error("Nahrávanie zlyhalo");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!form.title.trim()) { toast.error("Zadaj názov"); return; }
    setSaving(true);
    const payload = {
      category: form.category,
      title: form.title.trim(),
      description: form.description.trim() || null,
      shelter_name: form.shelter_name.trim() || null,
      donor_name: form.donor_name.trim() || null,
      amount_cents: form.amount ? Math.round(parseFloat(form.amount.replace(",", ".")) * 100) : null,
      image_url: form.image_url || null,
      record_date: form.record_date,
      published: form.published,
    };
    const { error } = editId
      ? await supabase.from("transparency_records").update(payload).eq("id", editId)
      : await supabase.from("transparency_records").insert(payload);
    if (error) toast.error("Nepodarilo sa uložiť");
    else { toast.success(editId ? "Upravené" : "Pridané"); invalidate(); resetForm(); }
    setSaving(false);
  };

  const edit = (r: Record) => {
    setForm({
      category: r.category,
      title: r.title,
      description: r.description || "",
      shelter_name: r.shelter_name || "",
      donor_name: r.donor_name || "",
      amount: r.amount_cents != null ? (r.amount_cents / 100).toString() : "",
      image_url: r.image_url || "",
      record_date: r.record_date,
      published: r.published,
    });
    setEditId(r.id);
    setShowForm(true);
  };

  const remove = async (id: string) => {
    if (!confirm("Naozaj odstrániť záznam?")) return;
    const { error } = await supabase.from("transparency_records").delete().eq("id", id);
    if (error) toast.error("Nepodarilo sa odstrániť");
    else { toast.success("Odstránené"); invalidate(); }
  };

  const togglePublish = async (r: Record) => {
    await supabase.from("transparency_records").update({ published: !r.published }).eq("id", r.id);
    invalidate();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transparentnosť</h1>
          <p className="text-muted-foreground text-sm mt-1">Zverejnené dôkazy o daroch a sponzorstve.</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl gradient-golden text-primary-foreground font-medium">
          <Plus className="w-4 h-4" /> Nový záznam
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-foreground">{editId ? "Upraviť záznam" : "Nový záznam"}</h2>
            <button onClick={resetForm} className="p-1.5 rounded-lg hover:bg-secondary"><X className="w-4 h-4" /></button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Kategória</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
                className="w-full px-3 py-2.5 rounded-xl bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                {CATEGORY_LABELS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Dátum</label>
              <input type="date" value={form.record_date} onChange={(e) => setForm({ ...form, record_date: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Názov *</label>
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Názov útulku</label>
              <input value={form.shelter_name} onChange={(e) => setForm({ ...form, shelter_name: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Meno darcu (so súhlasom)</label>
              <input value={form.donor_name} onChange={(e) => setForm({ ...form, donor_name: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Suma (€, voliteľné)</label>
            <input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} inputMode="decimal" placeholder="napr. 50"
              className="w-full px-3 py-2.5 rounded-xl bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Popis</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
              className="w-full px-3 py-2.5 rounded-xl bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Dôkaz (obrázok / dokument)</label>
            {form.image_url && <img src={form.image_url} alt="náhľad" className="w-40 h-28 object-cover rounded-lg mb-2 border border-border" />}
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-foreground text-sm font-medium cursor-pointer hover:bg-secondary/80">
              <Upload className="w-4 h-4" /> {uploading ? "Nahrávam..." : "Nahrať obrázok"}
              <input type="file" accept="image/*" className="hidden" disabled={uploading}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
            </label>
          </div>

          <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
            <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} className="w-4 h-4 accent-primary" />
            Zverejniť záznam
          </label>

          <div className="flex gap-2">
            <button onClick={save} disabled={saving} className="px-5 py-2.5 rounded-xl gradient-golden text-primary-foreground font-medium disabled:opacity-50">
              {saving ? "Ukladám..." : "Uložiť"}
            </button>
            <button onClick={resetForm} className="px-5 py-2.5 rounded-xl bg-secondary text-foreground font-medium">Zrušiť</button>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className="text-muted-foreground">Načítavam...</p>
      ) : records.length === 0 ? (
        <p className="text-muted-foreground">Zatiaľ žiadne záznamy.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {records.map((r) => (
            <div key={r.id} className={`bg-card border border-border rounded-xl overflow-hidden ${r.published ? "" : "opacity-60"}`}>
              {r.image_url && <img src={r.image_url} alt={r.title} className="w-full aspect-video object-cover" />}
              <div className="p-4 space-y-1">
                <span className="text-xs text-primary font-medium">{CATEGORY_LABELS.find((c) => c.value === r.category)?.label}</span>
                <h3 className="font-bold text-foreground">{r.title}</h3>
                {r.shelter_name && <p className="text-sm text-muted-foreground">Útulok: {r.shelter_name}</p>}
                {r.amount_cents != null && <p className="text-sm font-semibold text-primary">{(r.amount_cents / 100).toFixed(2).replace(".", ",")} €</p>}
                <p className="text-xs text-muted-foreground">{new Date(r.record_date).toLocaleDateString("sk-SK")}</p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <button onClick={() => togglePublish(r)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-secondary text-foreground text-xs font-medium hover:bg-secondary/80">
                    {r.published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {r.published ? "Skryť" : "Zverejniť"}
                  </button>
                  <button onClick={() => edit(r)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-secondary text-foreground text-xs font-medium hover:bg-secondary/80">
                    <Pencil className="w-3.5 h-3.5" /> Upraviť
                  </button>
                  <button onClick={() => remove(r.id)} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20">
                    <Trash2 className="w-3.5 h-3.5" /> Zmazať
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminTransparency;
