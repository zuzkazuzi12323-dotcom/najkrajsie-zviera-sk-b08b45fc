import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BookOpen, Truck, CreditCard, ShieldCheck, Sparkles, Upload, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { usePageTitle } from "@/hooks/usePageTitle";

const MAX_PHOTOS = 10;
const MIN_PHOTOS = 5;

const Kniha = () => {
  usePageTitle(
    "Kniha o vašom psovi za 29,99 € – doprava zadarmo | NajkrajšíPes.eu",
    "Vytvorte knihu svojho psa: 10 strán A5, mäkká lesklá väzba, tlač aj doprava zadarmo a PDF do e-mailu. Dodanie 3–5 dní.",
  );

  const [params] = useSearchParams();
  const [dogName, setDogName] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [story, setStory] = useState("");
  const [aiHelp, setAiHelp] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stav = params.get("stav");
    if (stav === "uspesna") toast.success("Ďakujeme! Objednávka je zaplatená, kniha ide do výroby.");
    if (stav === "zrusena") toast.error("Platba bola zrušená.");
  }, [params]);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const picked = Array.from(files).filter((f) => f.type.startsWith("image/")).slice(0, MAX_PHOTOS);
    if (picked.length < files.length) toast.info(`Použijeme maximálne ${MAX_PHOTOS} fotiek.`);
    setPhotos(picked);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dogName.trim() || !customerName.trim() || !address.trim() || !email.trim()) {
      toast.error("Vyplňte prosím meno psa, vaše meno, adresu a e-mail.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      toast.error("Zadajte platný e-mail.");
      return;
    }
    if (photos.length < MIN_PHOTOS) {
      toast.error(`Nahrajte prosím ${MIN_PHOTOS}–${MAX_PHOTOS} fotiek.`);
      return;
    }
    if (!aiHelp && story.trim().length < 20) {
      toast.error("Napíšte aspoň 3 vety o psovi, alebo zaškrtnite pomoc s AI príbehom.");
      return;
    }

    setLoading(true);
    try {
      const folder = crypto.randomUUID();
      const paths: string[] = [];
      for (const [i, file] of photos.entries()) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${folder}/${i + 1}.${ext}`;
        const { error } = await supabase.storage.from("book-photos").upload(path, file, { upsert: true });
        if (error) throw error;
        paths.push(path);
      }

      const { data: order, error: orderError } = await supabase
        .from("book_orders")
        .insert({
          dog_name: dogName.trim(),
          breed: breed.trim() || null,
          age: age.trim() || null,
          story: story.trim() || null,
          ai_help: aiHelp,
          photos: paths,
          customer_name: customerName.trim(),
          address: address.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
        })
        .select("id")
        .single();
      if (orderError) throw orderError;

      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-book-checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id }),
      });
      const json = await res.json();
      if (!res.ok || !json.url) throw new Error(json.error || "Platbu sa nepodarilo vytvoriť");
      window.location.href = json.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Nastalo neznáme zlyhanie");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* HERO */}
      <section className="bg-book-orange text-book-orange-foreground">
        <div className="container mx-auto max-w-4xl px-4 py-14 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold">
            <BookOpen className="h-4 w-4" /> Kniha o vašom psovi
          </span>
          <h1 className="mt-5 text-3xl font-extrabold sm:text-5xl">
            Vytvorte KNIHU svojho psa za 29,99 € – Doprava ZADARMO
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-pretty sm:text-lg">
            Nahrajte 5–10 fotiek, napíšte 3 vety alebo kliknite „Pomôž mi napísať príbeh“ pomocou AI.
            Vytlačíme 10 strán A5 a pošleme zadarmo domov do 3–5 dní.
          </p>
        </div>
      </section>

      {/* FORMULÁR */}
      <section className="container mx-auto max-w-3xl px-4 py-12">
        <form onSubmit={submit} className="space-y-8 rounded-3xl border border-book-orange/30 bg-white p-6 shadow-elevated sm:p-8">
          <div>
            <h2 className="text-xl font-bold text-foreground">O vašom psovi</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="dogName">Meno psa *</Label>
                <Input id="dogName" value={dogName} onChange={(e) => setDogName(e.target.value)} maxLength={60} placeholder="Rex" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="breed">Plemeno</Label>
                <Input id="breed" value={breed} onChange={(e) => setBreed(e.target.value)} maxLength={60} placeholder="Labrador" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age">Vek</Label>
                <Input id="age" value={age} onChange={(e) => setAge(e.target.value)} maxLength={30} placeholder="3 roky" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Label htmlFor="story">3 vety o psovi</Label>
              <Textarea
                id="story"
                value={story}
                onChange={(e) => setStory(e.target.value)}
                maxLength={1000}
                rows={4}
                placeholder="Napíšte 3 vety – ako ste sa našli, čo najviac miluje, čo vás na ňom dojíma."
              />
            </div>
            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl bg-book-orange/10 p-4">
              <Checkbox checked={aiHelp} onCheckedChange={(v) => setAiHelp(v === true)} className="mt-0.5" />
              <span className="text-sm text-foreground">
                <span className="inline-flex items-center gap-1.5 font-semibold">
                  <Sparkles className="h-4 w-4 text-book-orange" /> Chcem pomoc s AI príbehom
                </span>
                <span className="mt-1 block text-muted-foreground">
                  Pomôžeme vám napísať príbeh podľa fotiek a vašich pár slov – pred tlačou vám ho pošleme na schválenie.
                </span>
              </span>
            </label>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground">Fotky ({MIN_PHOTOS}–{MAX_PHOTOS})</h2>
            <label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-book-orange/50 bg-book-orange/5 px-4 py-8 text-center">
              <Upload className="h-6 w-6 text-book-orange" />
              <span className="text-sm font-semibold text-foreground">Nahrať fotky</span>
              <span className="text-xs text-muted-foreground">JPG alebo PNG, max 15 MB na fotku</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
            </label>
            {photos.length > 0 && (
              <p className="mt-3 flex items-center gap-2 text-sm font-medium text-foreground">
                <CheckCircle2 className="h-4 w-4 text-book-orange" /> Vybraných fotiek: {photos.length}
              </p>
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground">Doručenie</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customerName">Meno a priezvisko *</Label>
                <Input id="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} maxLength={100} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefón</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} placeholder="+421 900 000 000" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">Adresa doručenia *</Label>
                <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} maxLength={200} placeholder="Ulica 1, 811 01 Bratislava" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="h-14 w-full rounded-full bg-book-orange text-base font-bold text-book-orange-foreground hover:bg-book-orange-dark"
          >
            {loading ? "Pripravujeme platbu…" : "Objednať za 29,99 € s dopravou zadarmo"}
          </Button>
        </form>

        {/* Pod formulárom */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {[
            { icon: BookOpen, text: "Cena 29,99 € = 10 strán A5 mäkká lesklá väzba + tlač + doprava zadarmo + PDF do e-mailu" },
            { icon: Truck, text: "Dodanie 3–5 dní zadarmo, Packeta / Pošta" },
            { icon: CreditCard, text: "Platba kartou" },
            { icon: ShieldCheck, text: "Reklamácie do 14 dní na e-mail infonajkrajsipes@gmail.com" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-start gap-3 rounded-2xl border border-border bg-white p-4">
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-book-orange" />
              <p className="text-sm text-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Kniha;
