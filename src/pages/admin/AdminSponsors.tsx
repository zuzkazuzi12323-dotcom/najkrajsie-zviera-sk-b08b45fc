import { useState, useRef } from "react";
import { Plus, Trash2, Pencil, Upload, X, ArrowUp, ArrowDown, Eye, EyeOff, ExternalLink } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type SponsorRow = {
  id: string;
  title: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  banner_text: string | null;
  link_url: string | null;
  cta_label: string | null;
  placement: string | null;
  featured: boolean;
  active: boolean;
  sort_order: number;
};

const PLACEMENTS: { value: string; label: string }[] = [
  { value: "partner", label: "Partner (zoznam + pätička)" },
  { value: "hero", label: "Hlavný partner (banner hore)" },
  { value: "voting", label: "Reklamný banner (hlasovanie)" },
];

const emptyForm = {
  title: "",
  description: "",
  logo_url: "",
  banner_url: "",
  banner_text: "",
  link_url: "",
  cta_label: "Navštíviť partnera",
  placement: "partner",
  featured: false,
  active: true,
};

const AdminSponsors = () => {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: sponsors = [] } = useQuery({
    queryKey: ["admin-sponsors"],
    queryFn: async () => {
      const { data } = await supabase
        .from("sponsors")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      return (data || []) as SponsorRow[];
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-sponsors"] });
    queryClient.invalidateQueries({ queryKey: ["active-sponsors"] });
  };

  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditId(null);
    setShowForm(false);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `sponsors/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) { toast.error("Chyba pri nahrávaní obrázku"); return null; }
    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(path);
    return urlData.publicUrl;
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    const url = await uploadImage(file);
    if (url) setForm((f) => ({ ...f, logo_url: url }));
    setUploadingLogo(false);
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    const url = await uploadImage(file);
    if (url) setForm((f) => ({ ...f, banner_url: url }));
    setUploadingBanner(false);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Vyplňte názov partnera"); return; }
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      logo_url: form.logo_url || null,
      banner_url: form.banner_url || null,
      banner_text: form.banner_text.trim() || null,
      link_url: form.link_url.trim() || null,
      cta_label: form.cta_label.trim() || null,
      placement: form.placement,
      featured: form.featured,
      active: form.active,
    };

    if (editId) {
      const { error } = await supabase.from("sponsors").update(payload).eq("id", editId);
      if (error) { toast.error("Chyba pri ukladaní"); return; }
      toast.success("Partner aktualizovaný");
    } else {
      const maxOrder = sponsors.reduce((m, s) => Math.max(m, s.sort_order || 0), 0);
      const { error } = await supabase.from("sponsors").insert({ ...payload, sort_order: maxOrder + 1 });
      if (error) { toast.error("Chyba pri vytváraní"); return; }
      toast.success("Partner pridaný");
    }
    invalidate();
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Naozaj odstrániť partnera?")) return;
    const { error } = await supabase.from("sponsors").delete().eq("id", id);
    if (error) { toast.error("Chyba pri mazaní"); return; }
    invalidate();
    toast.success("Partner odstránený");
  };

  const toggleActive = async (s: SponsorRow) => {
    await supabase.from("sponsors").update({ active: !s.active }).eq("id", s.id);
    invalidate();
  };

  const move = async (s: SponsorRow, dir: -1 | 1) => {
    const idx = sponsors.findIndex((x) => x.id === s.id);
    const target = sponsors[idx + dir];
    if (!target) return;
    await Promise.all([
      supabase.from("sponsors").update({ sort_order: target.sort_order }).eq("id", s.id),
      supabase.from("sponsors").update({ sort_order: s.sort_order }).eq("id", target.id),
    ]);
    invalidate();
  };

  const startEdit = (s: SponsorRow) => {
    setForm({
      title: s.title || "",
      description: s.description || "",
      logo_url: s.logo_url || "",
      banner_url: s.banner_url || "",
      banner_text: s.banner_text || "",
      link_url: s.link_url || "",
      cta_label: s.cta_label || "Navštíviť partnera",
      placement: s.placement || "partner",
      featured: s.featured,
      active: s.active,
    });
    setEditId(s.id);
    setShowForm(true);
  };

  const placementLabel = (p: string | null) =>
    PLACEMENTS.find((x) => x.value === p)?.label || "Partner";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Partneri a bannery</h1>
          <p className="text-sm text-muted-foreground">Spravujte partnerov, sponzorov a reklamné bannery.</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="gradient-golden text-primary-foreground px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Pridať partnera
        </button>
      </div>

      {showForm && (
        <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
          <h3 className="font-semibold text-foreground">{editId ? "Upraviť partnera" : "Nový partner"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Názov spoločnosti *" className="px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm" />
            <input value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} placeholder="Odkaz na web (https://...)" className="px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm" />
            <select value={form.placement} onChange={(e) => setForm({ ...form, placement: e.target.value })} className="px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm">
              {PLACEMENTS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            <input value={form.cta_label} onChange={(e) => setForm({ ...form, cta_label: e.target.value })} placeholder="Text tlačidla" className="px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm" />
          </div>

          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Krátky popis partnera" rows={2} className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm" />

          {/* Logo upload */}
          <div className="flex items-center gap-2">
            <input ref={logoRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            <button type="button" onClick={() => logoRef.current?.click()} disabled={uploadingLogo}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm hover:bg-secondary transition-colors disabled:opacity-50 flex-1">
              <Upload className="w-4 h-4" />
              {uploadingLogo ? "Nahrávam..." : form.logo_url ? "Zmeniť logo" : "Nahrať logo"}
            </button>
            {form.logo_url && (
              <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-border shrink-0 bg-white">
                <img src={form.logo_url} alt="" className="w-full h-full object-contain" />
                <button onClick={() => setForm({ ...form, logo_url: "" })} className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center">
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Banner upload + text (for banner placements) */}
          <div className="space-y-2 border-t border-border pt-4">
            <p className="text-sm font-medium text-foreground">Reklamný banner (voliteľné)</p>
            <div className="flex items-center gap-2">
              <input ref={bannerRef} type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
              <button type="button" onClick={() => bannerRef.current?.click()} disabled={uploadingBanner}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm hover:bg-secondary transition-colors disabled:opacity-50 flex-1">
                <Upload className="w-4 h-4" />
                {uploadingBanner ? "Nahrávam..." : form.banner_url ? "Zmeniť banner" : "Nahrať banner"}
              </button>
              {form.banner_url && (
                <div className="relative w-20 h-10 rounded-lg overflow-hidden border border-border shrink-0 bg-white">
                  <img src={form.banner_url} alt="" className="w-full h-full object-cover" />
                  <button onClick={() => setForm({ ...form, banner_url: "" })} className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
            <input value={form.banner_text} onChange={(e) => setForm({ ...form, banner_text: e.target.value })} placeholder="Text banneru (voliteľné)" className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm" />
          </div>

          <div className="flex flex-wrap gap-4 border-t border-border pt-4">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Aktívny
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Hlavný partner
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="gradient-golden text-primary-foreground px-5 py-2 rounded-xl font-medium text-sm">Uložiť</button>
            <button onClick={resetForm} className="px-5 py-2 rounded-xl text-sm text-muted-foreground hover:bg-secondary">Zrušiť</button>
          </div>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead><tr className="border-b border-border text-left text-muted-foreground">
            <th className="px-4 py-3">Poradie</th><th className="px-4 py-3">Partner</th><th className="px-4 py-3">Umiestnenie</th><th className="px-4 py-3">Stav</th><th className="px-4 py-3"></th>
          </tr></thead>
          <tbody>
            {sponsors.map((s, i) => (
              <tr key={s.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-0.5">
                    <button disabled={i === 0} onClick={() => move(s, -1)} className="p-1 rounded hover:bg-secondary text-muted-foreground disabled:opacity-30"><ArrowUp className="w-3.5 h-3.5" /></button>
                    <button disabled={i === sponsors.length - 1} onClick={() => move(s, 1)} className="p-1 rounded hover:bg-secondary text-muted-foreground disabled:opacity-30"><ArrowDown className="w-3.5 h-3.5" /></button>
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-foreground">
                  <div className="flex items-center gap-2">
                    {s.logo_url
                      ? <img src={s.logo_url} alt="" className="w-9 h-9 rounded object-contain bg-white border border-border" />
                      : <div className="w-9 h-9 rounded bg-secondary" />}
                    <div>
                      <p className="flex items-center gap-1">{s.title} {s.featured && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold">HLAVNÝ</span>}</p>
                      {s.link_url && <a href={s.link_url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-muted-foreground hover:text-primary flex items-center gap-1"><ExternalLink className="w-3 h-3" /> web</a>}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{placementLabel(s.placement)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${s.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {s.active ? "Aktívny" : "Neaktívny"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                  <button onClick={() => toggleActive(s)} title={s.active ? "Deaktivovať" : "Aktivovať"} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground">{s.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
                  <button onClick={() => startEdit(s)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
            {sponsors.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">Zatiaľ žiadni partneri. Pridajte prvého.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSponsors;
