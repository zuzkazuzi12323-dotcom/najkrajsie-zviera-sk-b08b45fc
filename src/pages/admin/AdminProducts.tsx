import { useState, useRef } from "react";
import { Plus, Trash2, Search, Pencil, Upload, X } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminProducts = () => {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", price: "", category: "dog", image_url: "", active: true });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: products = [] } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const resetForm = () => {
    setForm({ name: "", description: "", price: "", category: "dog", image_url: "", active: true });
    setEditId(null);
    setShowForm(false);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) {
      toast.error("Chyba pri nahrávaní obrázku");
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
    setForm((f) => ({ ...f, image_url: urlData.publicUrl }));
    setUploading(false);
    toast.success("Obrázok nahraný");
  };

  const handleSave = async () => {
    if (!form.name || !form.price) { toast.error("Vyplňte názov a cenu"); return; }
    const priceInt = Math.round(parseFloat(form.price) * 100);
    if (isNaN(priceInt) || priceInt <= 0) { toast.error("Neplatná cena"); return; }

    const payload = { name: form.name, description: form.description || null, price: priceInt, category: form.category, image_url: form.image_url || null, active: form.active };

    if (editId) {
      const { error } = await supabase.from("products").update(payload).eq("id", editId);
      if (error) { toast.error("Chyba pri ukladaní"); return; }
      toast.success("Produkt aktualizovaný");
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) { toast.error("Chyba pri vytváraní"); return; }
      toast.success("Produkt vytvorený");
    }
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Naozaj odstrániť produkt?")) return;
    await supabase.from("products").delete().eq("id", id);
    queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    toast.success("Produkt odstránený");
  };

  const startEdit = (p: (typeof products)[0]) => {
    setForm({ name: p.name, description: p.description || "", price: (p.price / 100).toFixed(2), category: p.category, image_url: p.image_url || "", active: p.active });
    setEditId(p.id);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Produkty e-shopu</h1>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="gradient-golden text-primary-foreground px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Pridať produkt
        </button>
      </div>

      {showForm && (
        <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
          <h3 className="font-semibold text-foreground">{editId ? "Upraviť produkt" : "Nový produkt"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Názov" className="px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm" />
            <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Cena (€)" type="number" step="0.01" className="px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm" />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm">
              <option value="dog">🐶 Psíky</option>
              <option value="cat">🐱 Mačky</option>
            </select>
            {/* Image upload */}
            <div className="flex items-center gap-2">
              <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm hover:bg-secondary transition-colors disabled:opacity-50 flex-1"
              >
                <Upload className="w-4 h-4" />
                {uploading ? "Nahrávam..." : form.image_url ? "Zmeniť obrázok" : "Nahrať obrázok"}
              </button>
              {form.image_url && (
                <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-border shrink-0">
                  <img src={form.image_url} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => setForm({ ...form, image_url: "" })} className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Popis" rows={2} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm" />
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Aktívny
          </label>
          <div className="flex gap-2">
            <button onClick={handleSave} className="gradient-golden text-primary-foreground px-5 py-2 rounded-xl font-medium text-sm">Uložiť</button>
            <button onClick={resetForm} className="px-5 py-2 rounded-xl text-sm text-muted-foreground hover:bg-secondary">Zrušiť</button>
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Hľadať produkty..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm" />
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border text-left text-muted-foreground">
            <th className="px-4 py-3">Produkt</th><th className="px-4 py-3">Kategória</th><th className="px-4 py-3">Cena</th><th className="px-4 py-3">Stav</th><th className="px-4 py-3"></th>
          </tr></thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 font-medium text-foreground flex items-center gap-2">
                  {p.image_url && <img src={p.image_url} alt="" className="w-8 h-8 rounded object-cover" />}
                  {p.name}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{p.category === "cat" ? "🐱 Mačky" : "🐶 Psíky"}</td>
                <td className="px-4 py-3 text-foreground">{(p.price / 100).toFixed(2)} €</td>
                <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs ${p.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{p.active ? "Aktívny" : "Neaktívny"}</span></td>
                <td className="px-4 py-3 text-right space-x-1">
                  <button onClick={() => startEdit(p)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProducts;
