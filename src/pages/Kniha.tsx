import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BookOpen, Truck, CreditCard, ShieldCheck, Sparkles, Upload, CheckCircle2, Eye } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { usePageTitle } from "@/hooks/usePageTitle";

const MAX_PHOTOS = 10;
const MIN_PHOTOS = 5;

const Kniha = () => {
  usePageTitle(
    "Kniha o vašom psovi za 29,99 € – doprava zadarmo | NajkrajšíPes.eu",
    "Vytvorte knihu svojho psa: 8 strán A5, mäkká lesklá väzba, tlač aj doprava zadarmo. Dodanie 3–5 dní.",
  );

  const [params] = useSearchParams();
  const [dogName, setDogName] = useState("");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [story, setStory] = useState("");
  const [generatingStory, setGeneratingStory] = useState(false);
  const [storyGenerated, setStoryGenerated] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewViewed, setPreviewViewed] = useState(false);

  const photoPreviews = useMemo(() => photos.map((photo) => URL.createObjectURL(photo)), [photos]);

  useEffect(() => {
    return () => photoPreviews.forEach((url) => URL.revokeObjectURL(url));
  }, [photoPreviews]);

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
    setPreviewViewed(false);
  };

  const hasThreeWords = story.trim().split(/\s+/).filter(Boolean).length >= 3;

  const generateStory = async () => {
    if (!dogName.trim()) {
      toast.error("Najprv zadajte meno psa.");
      return;
    }
    if (!hasThreeWords) {
      toast.error("Napíšte aspoň 3 slová o vašom psovi.");
      return;
    }

    setGeneratingStory(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-book-story", {
        body: {
          dogName: dogName.trim(),
          breed: breed.trim(),
          age: age.trim(),
          keywords: story.trim(),
        },
      });
      if (error) throw error;
      if (!data?.story) throw new Error("Príbeh sa nepodarilo vygenerovať.");
      setStory(data.story);
      setStoryGenerated(true);
      setPreviewViewed(false);
      toast.success("Príbeh je pripravený. Môžete ho ľubovoľne upraviť.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Príbeh sa nepodarilo vygenerovať.");
    } finally {
      setGeneratingStory(false);
    }
  };

  const openPreview = () => {
    if (!dogName.trim()) {
      toast.error("Zadajte meno psa.");
      return;
    }
    if (photos.length < MIN_PHOTOS) {
      toast.error(`Nahrajte prosím ${MIN_PHOTOS}–${MAX_PHOTOS} fotiek.`);
      return;
    }
    if (!hasThreeWords) {
      toast.error("Napíšte aspoň 3 slová o vašom psovi.");
      return;
    }
    setPreviewViewed(true);
    setPreviewOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dogName.trim() || !customerName.trim() || !street.trim() || !city.trim() || !zip.trim() || !email.trim()) {
      toast.error("Vyplňte prosím meno psa, vaše meno, ulicu, obec, PSČ a e-mail.");
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
    if (!hasThreeWords) {
      toast.error("Napíšte aspoň 3 slová o vašom psovi.");
      return;
    }
    if (!previewViewed) {
      toast.error("Pred zaplatením si najprv otvorte náhľad knihy.");
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
          ai_help: storyGenerated,
          photos: paths,
          customer_name: customerName.trim(),
          street: street.trim(),
          city: city.trim(),
          zip: zip.trim(),
          address: `${street.trim()}, ${zip.trim()} ${city.trim()}`,
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
            Nahrajte 5–10 fotiek a napíšte aspoň 3 slová o svojom psovi. Príbeh vám vytvorí AI a môžete si ho upraviť.
            Vytlačíme 8 strán A5 a pošleme zadarmo domov do 3–5 dní.
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
              <Label htmlFor="story">Príbeh a poznámky o psovi *</Label>
              <Textarea
                id="story"
                value={story}
                onChange={(e) => {
                  setStory(e.target.value);
                  setPreviewViewed(false);
                }}
                maxLength={5000}
                rows={8}
                placeholder="Napíšte aspoň 3 slová – napríklad: hravý, verný, miluje prechádzky."
              />
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={generatingStory}
              onClick={generateStory}
              className="mt-4 w-full border-book-orange text-book-orange hover:bg-book-orange/10 hover:text-book-orange sm:w-auto"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {generatingStory ? "Generujem príbeh…" : "Vygenerovať príbeh s AI"}
            </Button>
            <p className="mt-2 text-sm text-muted-foreground">Vygenerovaný príbeh môžete pred objednaním ľubovoľne upraviť.</p>
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
                <Label htmlFor="street">Ulica a číslo *</Label>
                <Input id="street" value={street} onChange={(e) => setStreet(e.target.value)} maxLength={150} placeholder="Hlavná 12" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Obec *</Label>
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} maxLength={100} placeholder="Bratislava" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">PSČ *</Label>
                <Input id="zip" value={zip} onChange={(e) => setZip(e.target.value)} maxLength={10} placeholder="811 01" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              onClick={openPreview}
              className="h-14 w-full rounded-full border-2 border-book-orange text-base font-bold text-book-orange hover:bg-book-orange/10 hover:text-book-orange"
            >
              <Eye className="mr-2 h-5 w-5" /> Náhľad knihy
            </Button>
            <Button
              type="submit"
              disabled={loading || !previewViewed}
              className="h-14 w-full rounded-full bg-book-orange text-base font-bold text-book-orange-foreground hover:bg-book-orange-dark"
            >
              {loading ? "Pripravujeme platbu…" : "Zaplatiť 29,99 €"}
            </Button>
            {!previewViewed && <p className="text-center text-xs text-muted-foreground">Platba sa sprístupní po otvorení náhľadu knihy.</p>}
          </div>
        </form>

        {/* Pod formulárom */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {[
            { icon: BookOpen, text: "Cena 29,99 € = 8 strán A5, mäkká lesklá väzba + tlač + doprava zadarmo" },
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

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Náhľad knihy o psovi {dogName}</DialogTitle>
            <DialogDescription>Orientačný náhľad obsahu a fotografií pred tlačou.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 8 }, (_, index) => {
              const paragraphs = story.split(/\n+/).filter((paragraph) => paragraph.trim());
              const text = paragraphs[index] || (index === 0 ? story : "");
              const photo = photoPreviews[index % Math.max(photoPreviews.length, 1)];
              return (
                <article key={index} className="min-h-80 overflow-hidden rounded-lg border border-border bg-card shadow-soft">
                  {photo && <img src={photo} alt={`Strana ${index + 1}`} className="h-44 w-full object-cover" />}
                  <div className="p-4">
                    <p className="text-xs font-semibold uppercase text-book-orange">Strana {index + 1}</p>
                    {index === 0 && <h3 className="mt-2 text-xl text-foreground">{dogName}</h3>}
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground">{text || "Fotografia vášho psa"}</p>
                  </div>
                </article>
              );
            })}
          </div>
          <Button type="button" onClick={() => setPreviewOpen(false)} className="w-full bg-book-orange text-book-orange-foreground hover:bg-book-orange-dark">
            Náhľad je v poriadku
          </Button>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Kniha;
