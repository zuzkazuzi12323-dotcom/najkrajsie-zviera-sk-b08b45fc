import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Megaphone, Plus, Trash2, Eye, EyeOff, Info, AlertTriangle, CheckCircle2, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Announcement } from "@/hooks/useAnnouncements";

const VARIANTS = [
  { value: "info", label: "Informácia", icon: Info },
  { value: "warning", label: "Upozornenie", icon: AlertTriangle },
  { value: "success", label: "Úspech", icon: CheckCircle2 },
];

// Predefined quick announcement templates — one click fills the form, then edit or send instantly
const QUICK_TEMPLATES: { title: string; message: string; variant: string }[] = [
  { title: "Nový útulok bol pridaný", message: "Do projektu NajkrajšíPes.sk pribudol nový útulok. Pozrite si jeho profil a podporte zvieratká, ktoré potrebujú pomoc. 🐾", variant: "success" },
  { title: "Nové zvieratá boli pridané", message: "Pridali sme nové zvieratká do súťaže! Príďte si ich pozrieť a zahlasujte za svojho favorita. 🐶", variant: "info" },
  { title: "Hľadáme dobrovoľníkov", message: "Hľadáme obetavých dobrovoľníkov, ktorí chcú pomôcť útulkom. Ak máte chuť pomáhať, ozvite sa nám – každá ruka je vzácna! ❤️", variant: "info" },
  { title: "Zvieratká čakajú na adopciu", message: "Mnohé zvieratká stále čakajú na svoj domov. Zvážte adopciu a darujte im druhú šancu na šťastný život. 🏡", variant: "info" },
  { title: "Pomôžte útulkom darovaním", message: "Vaša podpora zachraňuje životy. Aj malý dar pomáha útulkom postarať sa o zvieratká v núdzi. Ďakujeme, že pomáhate! 🙏", variant: "warning" },
  { title: "Ďakujeme za vašu podporu", message: "Zo srdca ďakujeme všetkým, ktorí podporujú náš projekt a pomáhajú zvieratkám. Spolu robíme veľké veci! 💛", variant: "success" },
  { title: "Dôležitá novinka v aplikácii", message: "Pripravili sme pre vás dôležitú novinku. Pozrite si najnovšie zmeny a vylepšenia na našej stránke. ✨", variant: "info" },
  { title: "Plánovaná údržba aplikácie", message: "Oznamujeme, že v najbližšom čase prebehne plánovaná údržba stránky. Ďakujeme za pochopenie a trpezlivosť. 🔧", variant: "warning" },
  { title: "Hlasovanie je spustené", message: "Hlasovanie v súťaži o najkrajšieho psa je spustené! Zahlasujte za svojho favorita – jeden hlas denne. 🗳️", variant: "success" },
  { title: "Blíži sa koniec hlasovania", message: "Nezabudnite zahlasovať – hlasovanie sa čoskoro uzatvára. Podporte svojho favorita, kým je čas! ⏰", variant: "warning" },
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

  // Fill the form from a template so the admin can edit before publishing
  const fillTemplate = (t: { title: string; message: string; variant: string }) => {
    setTitle(t.title);
    setMessage(t.message);
    setVariant(t.variant);
    toast.success("Šablóna vyplnená – môžete upraviť alebo zverejniť");
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Publish a template instantly with one click
  const sendTemplate = async (t: { title: string; message: string; variant: string }) => {
    setSaving(true);
    const { error } = await supabase.from("site_announcements").insert({
      title: t.title,
      message: t.message,
      variant: t.variant,
      active: true,
    } as any);
    setSaving(false);
    if (error) {
      toast.error("Nepodarilo sa zverejniť oznámenie");
      return;
    }
    invalidate();
    toast.success("Oznámenie bolo okamžite zverejnené na stránke");
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

      {/* Quick announcement templates */}
      <div className="bg-card rounded-2xl p-5 border border-border space-y-3">
        <div>
          <h2 className="font-semibold text-foreground flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> Rýchle upozornenia</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Predpripravené šablóny. Kliknite na „Vyplniť" pre úpravu pred zverejnením, alebo „Zverejniť ihneď" pre okamžité odoslanie.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {QUICK_TEMPLATES.map((t, i) => {
            const V = VARIANTS.find((v) => v.value === t.variant) ?? VARIANTS[0];
            return (
              <div key={i} className="rounded-xl border border-border bg-background p-3 flex flex-col">
                <div className="flex items-center gap-1.5 mb-1">
                  <V.icon className="w-4 h-4 text-primary shrink-0" />
                  <h3 className="text-sm font-semibold text-foreground">{t.title}</h3>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-3 flex-1">{t.message}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => fillTemplate(t)}
                    className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:bg-secondary"
                  >
                    Vyplniť
                  </button>
                  <button
                    onClick={() => sendTemplate(t)}
                    disabled={saving}
                    className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium gradient-golden text-primary-foreground disabled:opacity-50"
                  >
                    Zverejniť ihneď
                  </button>
                </div>
              </div>
            );
          })}
        </div>
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
