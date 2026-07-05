import { useState } from "react";
import { HousePlus, CheckCircle2, Loader2, Copy, Check, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

const emptyForm = {
  name: "",
  city: "",
  description: "",
  support_url: "",
  iban: "",
  bank_holder: "",
  contact_name: "",
  contact_email: "",
  contact_phone: "",
  logo_url: "",
};

const ShelterApply = () => {
  const [form, setForm] = useState({ ...emptyForm });
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);

  // Always share the public, published site URL (never the preview/editor URL that
  // would ask visitors to log in) so social links open the page directly.
  const PUBLIC_SITE_URL = "https://najkrajsipes.sk";
  const shareUrl = `${PUBLIC_SITE_URL}/spolupraca-utulky`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Odkaz bol skopírovaný");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Odkaz sa nepodarilo skopírovať");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Spolupráca s útulkami – NajkrajšíPes.sk",
          text: "Ste slovenský útulok? Zapojte sa do projektu NajkrajšíPes.sk.",
          url: shareUrl,
        });
      } catch {
        /* user canceled */
      }
    } else {
      handleCopy();
    }
  };

  const set = (k: keyof typeof emptyForm, v: string) => setForm((f) => ({ ...f, [k]: v }));


  const handleLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `shelter-applications/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) {
      toast.error("Chyba pri nahrávaní loga");
    } else {
      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      set("logo_url", data.publicUrl);
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Vyplňte názov útulku");
    if (!form.contact_email.trim()) return toast.error("Vyplňte kontaktný e-mail");
    if (!agreed) return toast.error("Musíte potvrdiť súhlas so spracovaním údajov");

    setSubmitting(true);
    const { error } = await supabase.from("shelter_applications").insert({
      name: form.name.trim(),
      city: form.city.trim() || null,
      description: form.description.trim() || null,
      support_url: form.support_url.trim() || null,
      iban: form.iban.trim() || null,
      bank_holder: form.bank_holder.trim() || null,
      contact_name: form.contact_name.trim() || null,
      contact_email: form.contact_email.trim(),
      contact_phone: form.contact_phone.trim() || null,
      logo_url: form.logo_url || null,
      agreed_terms: true,
      status: "pending",
    });
    setSubmitting(false);
    if (error) {
      toast.error("Žiadosť sa nepodarilo odoslať. Skúste to znova.");
      return;
    }
    setDone(true);
    setForm({ ...emptyForm });
    setAgreed(false);
  };

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground text-sm";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <div className="flex items-center gap-3 mb-3 justify-center">
          <div className="w-12 h-12 rounded-xl gradient-golden flex items-center justify-center">
            <HousePlus className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Spolupráca s útulkami</h1>
        </div>
        <p className="text-center text-muted-foreground max-w-xl mx-auto text-pretty mb-8">
          Ste slovenský útulok a chcete sa zapojiť do projektu NajkrajšíPes.sk? Vyplňte formulár nižšie.
          Každú žiadosť ručne skontrolujeme a schválime. Útulok sa zverejní až po schválení organizátorom.
        </p>

        <div className="max-w-xl mx-auto mb-8 bg-card rounded-2xl p-4 md:p-5 border border-border shadow-soft">
          <p className="text-sm font-semibold text-foreground mb-3 text-center">
            Zdieľajte túto sekciu s útulkami na sociálnych sieťach
          </p>
          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            <div className="flex-1 px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-muted-foreground truncate flex items-center">
              {shareUrl}
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-secondary text-foreground text-sm font-medium hover:bg-secondary/70"
            >
              {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
              {copied ? "Skopírované" : "Kopírovať odkaz"}
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center justify-center gap-2 gradient-golden text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold"
            >
              <Share2 className="w-4 h-4" /> Zdieľať
            </button>
          </div>
        </div>



        {done ? (
          <div className="bg-card rounded-2xl p-8 text-center shadow-elevated border border-border">
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">Žiadosť bola odoslaná</h2>
            <p className="text-muted-foreground text-pretty mb-6">
              Ďakujeme! Vašu žiadosť sme prijali a čaká na manuálne schválenie. Ozveme sa vám na uvedený e-mail.
            </p>
            <Link to="/" className="text-primary font-semibold hover:underline">← Späť na hlavnú stránku</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-6 md:p-8 shadow-elevated border border-border space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Názov útulku *" className={inputClass} />
              <input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Mesto" className={inputClass} />
            </div>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Krátky popis útulku" rows={3} className={inputClass} />
            <input value={form.support_url} onChange={(e) => set("support_url", e.target.value)} placeholder="Webová stránka / odkaz na podporu (https://...)" className={inputClass} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={form.iban} onChange={(e) => set("iban", e.target.value)} placeholder="IBAN útulku (SK...)" className={inputClass} />
              <input value={form.bank_holder} onChange={(e) => set("bank_holder", e.target.value)} placeholder="Majiteľ účtu" className={inputClass} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)} placeholder="Kontaktná osoba" className={inputClass} />
              <input value={form.contact_email} onChange={(e) => set("contact_email", e.target.value)} type="email" placeholder="Kontaktný e-mail *" className={inputClass} />
            </div>
            <input value={form.contact_phone} onChange={(e) => set("contact_phone", e.target.value)} placeholder="Telefón (nepovinné)" className={inputClass} />

            <div>
              <label className="block text-sm text-muted-foreground mb-1">Logo útulku (nepovinné)</label>
              <input type="file" accept="image/*" onChange={handleLogo} className="text-sm text-foreground" />
              {uploading && <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Nahrávam...</p>}
              {form.logo_url && <img src={form.logo_url} alt="logo" className="mt-2 w-20 h-20 object-contain rounded-lg border border-border bg-white" />}
            </div>

            <label className="flex items-start gap-2 text-sm text-foreground border-t border-border pt-4">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1" />
              <span>
                Potvrdzujem pravdivosť uvedených údajov a súhlasím so spracovaním osobných údajov na účely
                posúdenia žiadosti o spoluprácu v súlade so{" "}
                <Link to="/ochrana-udajov" className="text-primary hover:underline">Zásadami ochrany osobných údajov</Link>. *
              </span>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full gradient-golden text-primary-foreground px-5 py-3 rounded-xl font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Odoslať žiadosť
            </button>
          </form>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ShelterApply;
