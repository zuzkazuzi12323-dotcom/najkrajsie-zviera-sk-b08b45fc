import { useState, useRef } from "react";
import { Plus, Trash2, Pencil, Upload, X, ArrowUp, ArrowDown, Eye, EyeOff, ExternalLink, MapPin, Star, Landmark } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type ShelterRow = {
  id: string;
  name: string;
  city: string | null;
  description: string | null;
  logo_url: string | null;
  support_url: string | null;
  iban: string | null;
  bank_holder: string | null;
  active: boolean;
  featured: boolean;
  show_iban: boolean;
  display_order: number;
  collected_cents: number;
  goal_cents: number;
  support_start_date: string | null;
  support_end_date: string | null;
};

const emptyForm = {
  name: "",
  city: "",
  description: "",
  logo_url: "",
  support_url: "",
  iban: "",
  bank_holder: "",
  active: true,
  featured: false,
  show_iban: true,
  collected_euros: "",
  goal_euros: "",
  support_start_date: "",
  support_end_date: "",
};

const CONTEST_ID = "00000000-0000-0000-0000-000000000002";

const AdminShelters = () => {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: shelters = [] } = useQuery({
    queryKey: ["admin-shelters"],
    queryFn: async () => {
      const { data } = await supabase
        .from("shelters")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: true });
      return (data || []) as ShelterRow[];
    },
  });

  const { data: sheltersVisible = true } = useQuery({
    queryKey: ["admin-shelters-visible"],
    queryFn: async () => {
      const { data } = await supabase
        .from("contest_settings")
        .select("shelters_visible")
        .eq("id", CONTEST_ID)
        .maybeSingle();
      return (data as any)?.shelters_visible ?? true;
    },
  });

  const toggleSheltersVisible = async () => {
    const { error } = await supabase
      .from("contest_settings")
      .update({ shelters_visible: !sheltersVisible } as any)
      .eq("id", CONTEST_ID);
    if (error) {
      toast.error("Chyba pri ukladaní");
      return;
    }
    queryClient.invalidateQueries({ queryKey: ["admin-shelters-visible"] });
    queryClient.invalidateQueries({ queryKey: ["shelters-visible"] });
    toast.success(!sheltersVisible ? "Sekcia zapnutá" : "Sekcia vypnutá");
  };


  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-shelters"] });
    queryClient.invalidateQueries({ queryKey: ["active-shelters"] });
    queryClient.invalidateQueries({ queryKey: ["featured-shelter"] });
  };


  const resetForm = () => {
    setForm({ ...emptyForm });
    setEditId(null);
    setShowForm(false);
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `shelters/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) {
      toast.error("Chyba pri nahrávaní loga");
      return null;
    }
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

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Vyplňte názov útulku");
      return;
    }
    const collectedEuros = parseFloat((form.collected_euros || "").replace(",", "."));
    const goalEuros = parseFloat((form.goal_euros || "").replace(",", "."));
    const payload = {
      name: form.name.trim(),
      city: form.city.trim() || null,
      description: form.description.trim() || null,
      logo_url: form.logo_url || null,
      support_url: form.support_url.trim() || null,
      iban: form.iban.trim() || null,
      bank_holder: form.bank_holder.trim() || null,
      active: form.active,
      featured: form.featured,
      show_iban: form.show_iban,
      collected_cents: isNaN(collectedEuros) ? 0 : Math.max(0, Math.round(collectedEuros * 100)),
      goal_cents: isNaN(goalEuros) ? 0 : Math.max(0, Math.round(goalEuros * 100)),
      support_start_date: form.support_start_date ? new Date(form.support_start_date).toISOString() : null,
      support_end_date: form.support_end_date ? new Date(form.support_end_date).toISOString() : null,
    };

    if (editId) {
      const { error } = await supabase.from("shelters").update(payload).eq("id", editId);
      if (error) {
        toast.error("Chyba pri ukladaní");
        return;
      }
      toast.success("Útulok aktualizovaný");
    } else {
      const maxOrder = shelters.reduce((m, s) => Math.max(m, s.display_order || 0), 0);
      const { error } = await supabase.from("shelters").insert({ ...payload, display_order: maxOrder + 1 });
      if (error) {
        toast.error("Chyba pri vytváraní");
        return;
      }
      toast.success("Útulok pridaný");
    }
    invalidate();
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Naozaj odstrániť útulok?")) return;
    const { error } = await supabase.from("shelters").delete().eq("id", id);
    if (error) {
      toast.error("Chyba pri mazaní");
      return;
    }
    invalidate();
    toast.success("Útulok odstránený");
  };

  const toggleActive = async (s: ShelterRow) => {
    await supabase.from("shelters").update({ active: !s.active }).eq("id", s.id);
    invalidate();
  };

  const move = async (s: ShelterRow, dir: -1 | 1) => {
    const idx = shelters.findIndex((x) => x.id === s.id);
    const target = shelters[idx + dir];
    if (!target) return;
    await Promise.all([
      supabase.from("shelters").update({ display_order: target.display_order }).eq("id", s.id),
      supabase.from("shelters").update({ display_order: s.display_order }).eq("id", target.id),
    ]);
    invalidate();
  };

  const startEdit = (s: ShelterRow) => {
    setForm({
      name: s.name || "",
      city: s.city || "",
      description: s.description || "",
      logo_url: s.logo_url || "",
      support_url: s.support_url || "",
      iban: s.iban || "",
      bank_holder: s.bank_holder || "",
      active: s.active,
      featured: s.featured,
      show_iban: s.show_iban,
      collected_euros: ((s.collected_cents || 0) / 100).toFixed(2),
    });
    setEditId(s.id);
    setShowForm(true);
  };

  const setFeatured = async (s: ShelterRow) => {
    await supabase.from("shelters").update({ featured: false }).neq("id", s.id);
    await supabase.from("shelters").update({ featured: true }).eq("id", s.id);
    invalidate();
    queryClient.invalidateQueries({ queryKey: ["featured-shelter"] });
    toast.success(`Aktuálne podporovaný útulok: ${s.name}`);
  };

  const toggleShowIban = async (s: ShelterRow) => {
    await supabase.from("shelters").update({ show_iban: !s.show_iban }).eq("id", s.id);
    invalidate();
    queryClient.invalidateQueries({ queryKey: ["featured-shelter"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Útulky</h1>
          <p className="text-sm text-muted-foreground">Spravujte útulky, ktorým súťaž poskytuje podporu.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="gradient-golden text-primary-foreground px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Pridať útulok
        </button>
      </div>

      {/* Info o vyzbieraných sumách */}
      <div className="bg-card rounded-2xl p-6 border border-border">
        <h3 className="font-semibold text-foreground">Vyzbierané sumy pre útulky</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Každý útulok má vlastnú evidenciu vyzbieranej sumy. Sumu upravíte v detaile útulku (tlačidlo Upraviť).
          Na hlavnej stránke sa zobrazuje suma aktuálne podporovaného útulku.
        </p>
      </div>


      {/* Zobrazenie sekcie na stránke */}
      <div className="bg-card rounded-2xl p-6 border border-border flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-foreground">Sekcia „Útulky, ktorým pomáhame"</h3>
          <p className="text-sm text-muted-foreground">
            Zobrazenie sekcie s útulkami na hlavnej stránke.{" "}
            <strong className="text-foreground">{sheltersVisible ? "Zapnutá" : "Vypnutá"}</strong>
          </p>
        </div>
        <button
          onClick={toggleSheltersVisible}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm ${
            sheltersVisible
              ? "border border-destructive/30 text-destructive hover:bg-destructive/10"
              : "gradient-golden text-primary-foreground"
          }`}
        >
          {sheltersVisible ? <><EyeOff className="w-4 h-4" /> Vypnúť</> : <><Eye className="w-4 h-4" /> Zapnúť</>}
        </button>
      </div>



      {showForm && (
        <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
          <h3 className="font-semibold text-foreground">{editId ? "Upraviť útulok" : "Nový útulok"}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Názov útulku *"
              className="px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm"
            />
            <input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="Mesto"
              className="px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm"
            />
          </div>
          <input
            value={form.support_url}
            onChange={(e) => setForm({ ...form, support_url: e.target.value })}
            placeholder="Odkaz na podporu / web útulku (https://...)"
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              value={form.iban}
              onChange={(e) => setForm({ ...form, iban: e.target.value })}
              placeholder="IBAN útulku (SK...)"
              className="px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm"
            />
            <input
              value={form.bank_holder}
              onChange={(e) => setForm({ ...form, bank_holder: e.target.value })}
              placeholder="Majiteľ účtu / názov"
              className="px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm"
            />
          </div>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Krátky popis útulku (1–2 vety)"
            rows={2}
            className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm"
          />

          <div>
            <label className="block text-xs text-muted-foreground mb-1">Vyzbieraná suma pre tento útulok (€)</label>
            <input
              value={form.collected_euros}
              onChange={(e) => setForm({ ...form, collected_euros: e.target.value })}
              placeholder="napr. 120.50"
              inputMode="decimal"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm"
            />
          </div>


          {/* Logo upload */}
          <div className="flex items-center gap-2">
            <input ref={logoRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
            <button
              type="button"
              onClick={() => logoRef.current?.click()}
              disabled={uploadingLogo}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm hover:bg-secondary transition-colors disabled:opacity-50 flex-1"
            >
              <Upload className="w-4 h-4" />
              {uploadingLogo ? "Nahrávam..." : form.logo_url ? "Zmeniť logo" : "Nahrať logo"}
            </button>
            {form.logo_url && (
              <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-border shrink-0 bg-white">
                <img src={form.logo_url} alt="" className="w-full h-full object-contain" />
                <button
                  onClick={() => setForm({ ...form, logo_url: "" })}
                  className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-4 h-4 flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4 border-t border-border pt-4">
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />{" "}
              Aktívny
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              />{" "}
              Aktuálne podporovaný útulok
            </label>
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={form.show_iban}
                onChange={(e) => setForm({ ...form, show_iban: e.target.checked })}
              />{" "}
              Zobraziť IBAN na stránke
            </label>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} className="gradient-golden text-primary-foreground px-5 py-2 rounded-xl font-medium text-sm">
              Uložiť
            </button>
            <button onClick={resetForm} className="px-5 py-2 rounded-xl text-sm text-muted-foreground hover:bg-secondary">
              Zrušiť
            </button>
          </div>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="px-4 py-3">Poradie</th>
              <th className="px-4 py-3">Útulok</th>
              <th className="px-4 py-3">Mesto</th>
              <th className="px-4 py-3">Stav</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {shelters.map((s, i) => (
              <tr key={s.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-0.5">
                    <button disabled={i === 0} onClick={() => move(s, -1)} className="p-1 rounded hover:bg-secondary text-muted-foreground disabled:opacity-30">
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button disabled={i === shelters.length - 1} onClick={() => move(s, 1)} className="p-1 rounded hover:bg-secondary text-muted-foreground disabled:opacity-30">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-foreground">
                  <div className="flex items-center gap-2">
                    {s.logo_url ? (
                      <img src={s.logo_url} alt="" className="w-9 h-9 rounded object-contain bg-white border border-border" />
                    ) : (
                      <div className="w-9 h-9 rounded bg-secondary" />
                    )}
                    <div>
                      <p>{s.name}</p>
                      {s.support_url && (
                        <a href={s.support_url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-muted-foreground hover:text-primary flex items-center gap-1">
                          <ExternalLink className="w-3 h-3" /> odkaz
                        </a>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {s.city ? (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {s.city}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <span className={`px-2 py-1 rounded-full text-xs w-fit ${s.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {s.active ? "Aktívny" : "Neaktívny"}
                    </span>
                    {s.featured && (
                      <span className="px-2 py-1 rounded-full text-xs w-fit bg-primary/15 text-primary flex items-center gap-1">
                        <Star className="w-3 h-3 fill-primary" /> Podporovaný
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                  <button onClick={() => setFeatured(s)} title="Nastaviť ako aktuálne podporovaný" className={`p-1.5 rounded-lg hover:bg-secondary ${s.featured ? "text-primary" : "text-muted-foreground"}`}>
                    <Star className={`w-4 h-4 ${s.featured ? "fill-primary" : ""}`} />
                  </button>
                  <button onClick={() => toggleShowIban(s)} title={s.show_iban ? "Skryť IBAN na stránke" : "Zobraziť IBAN na stránke"} className={`p-1.5 rounded-lg hover:bg-secondary ${s.show_iban ? "text-primary" : "text-muted-foreground"}`}>
                    <Landmark className="w-4 h-4" />
                  </button>
                  <button onClick={() => toggleActive(s)} title={s.active ? "Deaktivovať" : "Aktivovať"} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground">
                    {s.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button onClick={() => startEdit(s)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {shelters.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  Zatiaľ žiadne útulky. Pridajte prvý.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminShelters;
