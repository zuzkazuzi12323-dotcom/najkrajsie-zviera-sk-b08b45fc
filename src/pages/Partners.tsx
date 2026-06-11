import { Handshake, Megaphone, Heart, BarChart3, Award, Users, Mail } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PartnersSection from "@/components/PartnersSection";
import { useActiveSponsors } from "@/hooks/useSponsors";
import { useSiteContent } from "@/hooks/useSiteContent";

const SPONSOR_EMAIL = "infonajkrajsipes@gmail.com";

const benefits = [
  {
    icon: Megaphone,
    title: "Viditeľnosť značky",
    text: "Vaše logo a odkaz na web zobrazíme v pätičke, na stránke partnerov aj v bannerovom priestore súťaže.",
  },
  {
    icon: Users,
    title: "Oslovenie milovníkov zvierat",
    text: "Dostanete sa k aktívnej komunite majiteľov psov a návštevníkov, ktorí denne hlasujú a sledujú súťaž.",
  },
  {
    icon: Heart,
    title: "Spoločensky zodpovedný marketing",
    text: "20 % z registrácií a nákupov venujeme útulkom. Vaša značka bude spojená s reálnou pomocou zvieratám.",
  },
  {
    icon: Award,
    title: "Partner cien pre víťazov",
    text: "Môžete venovať ceny pre víťazov súťaže a získať tak prirodzené prepojenie s ocenením Najkrajší pes Slovenska.",
  },
  {
    icon: BarChart3,
    title: "Reklamný priestor",
    text: "Ponúkame priestor pre bannery na hlavnej stránke a v sekciách s vysokou návštevnosťou.",
  },
  {
    icon: Handshake,
    title: "Dlhodobá spolupráca",
    text: "Súťaž prebieha pravidelne každý mesiac, čo vytvára priestor pre dlhodobé a opakované partnerstvá.",
  },
];

const Partners = () => {
  const { data: sponsors = [] } = useActiveSponsors();
  const t = useSiteContent();
  const hasPartners = sponsors.some((s) => s.logo_url);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-3 justify-center">
          <div className="w-12 h-12 rounded-xl gradient-golden flex items-center justify-center">
            <Handshake className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">{t("partners.title", "Partneri a sponzori")}</h1>
        </div>
        <p className="text-center text-muted-foreground max-w-2xl mx-auto">
          Spojte svoju značku s najkrajšou súťažou pre psíkov na Slovensku a zároveň pomáhajte útulkom.
        </p>
      </div>

      {/* Benefits */}
      <section className="container mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold text-foreground text-center mb-8">Čo získate spoluprácou?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-2xl p-6 shadow-soft border border-border"
            >
              <div className="w-11 h-11 rounded-xl gradient-golden flex items-center justify-center mb-4">
                <b.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-foreground mb-1.5">{b.title}</h3>
              <p className="text-sm text-muted-foreground text-pretty">{b.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="container mx-auto px-4 pb-16">
        <div className="bg-card rounded-2xl p-8 md:p-10 shadow-elevated border border-border max-w-3xl mx-auto text-center">
          <div className="w-14 h-14 rounded-2xl gradient-golden flex items-center justify-center mx-auto mb-4">
            <Mail className="w-7 h-7 text-primary-foreground" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Chcete sa stať partnerom alebo sponzorom?</h2>
          <p className="text-muted-foreground mb-6 text-pretty">
            Ak máte záujem o spoluprácu, reklamný priestor alebo venovanie cien pre víťazov, napíšte nám na e-mail.
            Radi vám pripravíme ponuku na mieru.
          </p>
          <a
            href={`mailto:${SPONSOR_EMAIL}?subject=Záujem o spoluprácu / sponzoring`}
            className="inline-flex items-center gap-2 gradient-golden text-primary-foreground px-6 py-3 rounded-full font-bold shadow-golden transition-transform hover:scale-105"
          >
            <Mail className="w-4 h-4" /> {SPONSOR_EMAIL}
          </a>
        </div>
      </section>

      {/* Existing partners */}
      {hasPartners ? (
        <PartnersSection />
      ) : (
        <div className="container mx-auto px-4 pb-20">
          <div className="bg-card rounded-2xl p-10 text-center shadow-soft border border-border max-w-2xl mx-auto">
            <p className="text-muted-foreground text-pretty">
              {t("partners.empty", "Momentálne pripravujeme spoluprácu s partnermi. Čoskoro tu nájdete našich partnerov.")}
            </p>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Partners;
