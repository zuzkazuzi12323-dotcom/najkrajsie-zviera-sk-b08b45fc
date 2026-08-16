import { motion } from "framer-motion";
import { Link } from "react-router-dom";
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
            20 % z každej úspešnej registrácie je <strong>REZERVOVANÝCH</strong> pre spolupracujúce útulky. 80 % ide na prevádzku
            stránky, vývoj, Stripe poplatky a ceny. Organizátorovi nejde priamy zisk. Citlivé údaje (napr. IBAN) zverejňujeme
            len so súhlasom útulku a v primeranom rozsahu.
          </p>
        </div>

        {/* Výzva pre útulky */}
        <div className="max-w-3xl mx-auto mb-10 rounded-2xl border-2 border-primary bg-primary/15 p-6 md:p-8 text-center">
          <p className="text-lg md:text-2xl font-bold text-foreground text-pretty">
            Momentálne máme 0 spolupracujúcich útulkov. Ak ste útulok, prihláste sa a celá rezervovaná suma pôjde vám! —{" "}
            <a href="mailto:infonajkrajsipes@gmail.com" className="text-primary underline">infonajkrajsipes@gmail.com</a>
          </p>
          <Link
            to="/spolupraca-utulky"
            className="mt-5 inline-flex items-center gap-2 gradient-golden text-primary-foreground px-6 py-3 rounded-full font-bold shadow-golden"
          >
            <Heart className="w-4 h-4" /> Som útulok, chcem spolupracovať
          </Link>
        </div>

        {/* Prehľad prevodov */}
        <div className="max-w-4xl mx-auto mb-12 overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-foreground">
              <tr>
                <th className="text-left font-semibold px-4 py-3">Dátum</th>
                <th className="text-left font-semibold px-4 py-3">Útulok</th>
                <th className="text-left font-semibold px-4 py-3">Suma</th>
                <th className="text-left font-semibold px-4 py-3">Doklad o prevode</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-muted-foreground text-pretty">
                  Zatiaľ žiadne prevody – čakáme na prvý spolupracujúci útulok. Rezervovaná suma sa akumuluje.
                </td>
              </tr>
            </tbody>
          </table>
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
