import { motion } from "framer-motion";
import { ShieldCheck, Heart, Gift, Building2, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTransparencyRecords, type TransparencyRecord, type TransparencyCategory } from "@/hooks/useTransparency";

const formatEur = (cents: number | null) =>
  cents == null ? null : `${(cents / 100).toFixed(2).replace(".", ",")} €`;

const CATEGORY_META: Record<TransparencyCategory, { label: string; icon: typeof Heart }> = {
  shelter: { label: "Finančný dar útulku", icon: Heart },
  sponsor: { label: "Sponzorský dar", icon: Building2 },
  user_gift: { label: "Dar od používateľa", icon: Gift },
};

const RecordCard = ({ r }: { r: TransparencyRecord }) => {
  const meta = CATEGORY_META[r.category] ?? CATEGORY_META.shelter;
  const Icon = meta.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col"
    >
      {r.image_url && (
        <img src={r.image_url} alt={r.title} loading="lazy" className="w-full aspect-video object-cover bg-muted" />
      )}
      <div className="p-5 flex flex-col gap-2 flex-1">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
          <Icon className="w-3.5 h-3.5" /> {meta.label}
        </span>
        <h3 className="font-bold text-foreground">{r.title}</h3>
        {r.shelter_name && <p className="text-sm text-muted-foreground">Útulok: {r.shelter_name}</p>}
        {r.donor_name && <p className="text-sm text-muted-foreground">Darca: {r.donor_name}</p>}
        {r.description && <p className="text-sm text-muted-foreground break-words">{r.description}</p>}
        <div className="mt-auto pt-3 flex items-center justify-between text-sm">
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            {new Date(r.record_date).toLocaleDateString("sk-SK", { day: "numeric", month: "long", year: "numeric" })}
          </span>
          {formatEur(r.amount_cents) && <span className="font-bold text-primary">{formatEur(r.amount_cents)}</span>}
        </div>
      </div>
    </motion.div>
  );
};

const Transparency = () => {
  const { data: records = [], isLoading } = useTransparencyRecords();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <div className="w-16 h-16 rounded-2xl gradient-golden flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Transparentnosť</h1>
          <p className="text-muted-foreground text-pretty">
            Všetky finančné dary útulkom, sponzorské príspevky a darované predmety sú tu verejne archivované a overiteľné.
            Z každej registrácie a podpory venujeme 20 % na útulky pre zvieratá ❤️. Citlivé údaje (napr. IBAN) zverejňujeme
            len so súhlasom útulku a v primeranom rozsahu. V sekcii <strong>❤️ Útulok týždňa</strong> každý týždeň
            zverejňujeme jeden aktuálne podporovaný útulok, ktorému môžete prispieť priamo cez SEPA QR kód.
          </p>
        </div>

        {isLoading ? (
          <p className="text-center text-muted-foreground">Načítavam záznamy...</p>
        ) : records.length === 0 ? (
          <p className="text-center text-muted-foreground text-pretty max-w-2xl mx-auto">
            Transparentne zverejníme každý dar pre útulky aj s dôkazom o prevode. Prvý záznam čoskoro! ❤️
          </p>

        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {records.map((r) => <RecordCard key={r.id} r={r} />)}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Transparency;
