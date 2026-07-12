import { Link } from "react-router-dom";
import { Heart, Users, Trophy, ArrowRight, Award, Gift, PawPrint, CreditCard, Vote, Share2, ShieldCheck, Sparkles, CheckCircle2, Home } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import heroImg from "@/assets/hero-dog.jpg";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DogCard from "@/components/DogCard";
import ContestCountdown from "@/components/ContestCountdown";
import PartnersSection from "@/components/PartnersSection";
import SheltersSection from "@/components/SheltersSection";
import FeaturedShelterSection from "@/components/FeaturedShelterSection";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const fetchDogsWithVotes = async () => {
  const { data: dogsData } = await supabase.from("dogs").select("*").eq("approved", true).eq("archived", false);
  if (!dogsData?.length) return [];
  const ownerIds = [...new Set(dogsData.map((d) => d.owner_id))];
  const [{ data: profiles }, { data: voteCounts }] = await Promise.all([
    supabase.from("profiles_public").select("user_id, display_name").in("user_id", ownerIds),
    supabase.from("votes").select("dog_id"),
  ]);
  const profileMap: Record<string, string> = {};
  profiles?.forEach((p) => { profileMap[p.user_id] = p.display_name || "Neznámy"; });
  const voteMap: Record<string, number> = {};
  voteCounts?.forEach((v) => { voteMap[v.dog_id] = (voteMap[v.dog_id] || 0) + 1; });
  return dogsData.map((d) => ({
    id: d.id, name: d.name, breed: d.breed, age: d.age, image_url: d.image_url,
    highlighted: d.highlighted, owner_name: profileMap[d.owner_id] || "Neznámy",
    votes: (voteMap[d.id] || 0) + ((d as any).boost_votes || 0), created_at: d.created_at,
    boost_votes: (d as any).boost_votes || 0, archived: (d as any).archived || false,
  }));
};

const Index = () => {
  const { user } = useAuth();
  


  const { data: allDogs = [] } = useQuery({
    queryKey: ["all-dogs-home"],
    queryFn: fetchDogsWithVotes,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const activeDogs = allDogs.filter((d: any) => !d.archived);
  const topDogs = [...activeDogs].sort((a, b) => b.votes - a.votes).slice(0, 6);
  const newestDogs = [...activeDogs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6);

  const { data: userVotes = [] } = useQuery({
    queryKey: ["user-votes", user?.id],
    enabled: !!user,
    staleTime: 60 * 1000,
    queryFn: async () => {
      const { data } = await supabase.from("votes").select("dog_id").eq("user_id", user!.id);
      return data?.map((v) => v.dog_id) || [];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const [{ data: activeDogsData }, { data: voteRows }, { count: userCount }] = await Promise.all([
        supabase.from("dogs").select("id, boost_votes").eq("approved", true).eq("archived", false),
        supabase.from("votes").select("dog_id"),
        supabase.from("profiles_public").select("user_id", { count: "exact", head: true }),
      ]);
      const activeDogIds = new Set((activeDogsData || []).map((dog) => dog.id));
      const freeVotes = (voteRows || []).filter((vote) => activeDogIds.has(vote.dog_id)).length;
      const boostVotes = (activeDogsData || []).reduce((sum, dog) => sum + ((dog as any).boost_votes || 0), 0);
      return { dogs: activeDogsData?.length || 0, votes: freeVotes + boostVotes, users: userCount || 0 };
    },
  });

  const statItems = [
    { icon: Heart, label: "Celkom hlasov", value: stats?.votes?.toLocaleString() || "0" },
    { icon: Users, label: "Súťažiacich psov", value: stats?.dogs?.toLocaleString() || "0" },
    { icon: Trophy, label: "Registrovaných", value: stats?.users?.toLocaleString() || "0" },
  ];

  const steps = [
    { icon: PawPrint, title: "Pridajte psa do súťaže", desc: "Vytvorte profil vášho psa s fotkou a základnými informáciami." },
    { icon: Gift, title: "Registrácia ZADARMO počas kampane", desc: "Počas kampane na Donio je registrácia psa bez poplatku. Po skončení kampane bude poplatok 2,99 €, pričom 20 % z každej platenej registrácie pôjde útulkom ❤️" },
    { icon: CheckCircle2, title: "Pes sa automaticky zaradí", desc: "Po registrácii sa pes ihneď zaradí do verejného hlasovania." },
    { icon: Share2, title: "Zdieľajte a zbierajte hlasy", desc: "Zdieľajte profil psa s rodinou a priateľmi." },
    { icon: Trophy, title: "Víťaz vyhráva", desc: "Pes s najviac hlasmi vyhráva súťaž." },
  ];

  const prizes = [
    { icon: Trophy, title: "Titul Najkrajší pes Slovenska", desc: "Prestížne ocenenie pre vášho miláčika" },
    { icon: Award, title: "Oficiálny certifikát víťaza", desc: "Krásny certifikát na stiahnutie a vytlačenie" },
    { icon: Sparkles, title: "Zverejnenie na stránke víťazov", desc: "Váš pes bude natrvalo uvedený medzi víťazmi" },
    { icon: Gift, title: "Vecné ceny", desc: "Vecná cena, ak bude dostupná od partnerov súťaže" },
  ];

  const rules = [
    "Počas kampane na Donio je registrácia psa zdarma. Po skončení kampane bude registračný poplatok 2,99 €.",
    "Hlasovanie je úplne bezplatné",
    "1 účet = 1 hlas za 24 hodín",
    "Víťazom je pes s najviac hlasmi",
    "Súťaž prebieha v pravidelných cykloch",
  ];

  const transparency = [
    { icon: Heart, title: "20 % útulkom", desc: "Z každej registrácie venujeme 20 % na útulky pre zvieratá." },
    { icon: ShieldCheck, title: "Verejne zverejnené", desc: "Názov útulku, dátum odoslania, výška príspevku aj dôkaz o prevode." },
    { icon: CheckCircle2, title: "Maximálna transparentnosť", desc: "Cieľom je maximálna transparentnosť a auditovateľnosť projektu." },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Najkrajší pes Slovenska" className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/85 via-foreground/55 to-foreground/20" />
        </div>
        <div className="relative container mx-auto px-4 py-24 md:py-40">
          <div className="max-w-2xl animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">Online súťaž o najkrajšieho psa Slovenska</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-background mb-4 leading-tight">
              NajkrajšíPes.sk
            </h1>
            <p className="text-lg md:text-xl text-background/90 mb-3 text-pretty">
              🎉 Počas kampane na Donio je registrácia vášho psa do súťaže úplne <strong>ZADARMO</strong>. Zapojte svojho miláčika do verejného hlasovania o titul Najkrajší pes Slovenska 🐶
            </p>
            <p className="text-base md:text-lg text-background/80 mb-8 text-pretty">
              Z každej registrácie venujeme <strong>20 %</strong> na podporu útulkov pre zvieratá ❤️
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/pridat" className="gradient-golden text-primary-foreground px-8 py-4 rounded-full font-bold shadow-golden flex items-center gap-2 text-lg active:scale-95 transition-transform">
                <PawPrint className="w-5 h-5" /> Pridať psa ZADARMO
              </Link>
              <Link to="/galeria" className="bg-background/20 backdrop-blur-sm text-background border border-background/40 px-8 py-4 rounded-full font-bold flex items-center gap-2 text-lg hover:bg-background/30 active:scale-95 transition-all">
                <Vote className="w-5 h-5" /> Hlasovať v súťaži
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {statItems.map((stat) => (
            <div key={stat.label} className="bg-card rounded-2xl p-4 md:p-6 shadow-elevated flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl gradient-golden flex items-center justify-center shrink-0">
                <stat.icon className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-lg md:text-2xl font-bold tabular-nums text-card-foreground">{stat.value}</p>
                <p className="text-xs md:text-sm text-muted-foreground truncate">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Aktuálne podporovaný útulok */}
      <FeaturedShelterSection />

      {/* Contest Countdown */}
      <ContestCountdown />

      {/* Ako to funguje */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Ako to funguje</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Päť jednoduchých krokov k titulu Najkrajší pes Slovenska</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
          {steps.map((step, i) => (
            <div key={step.title} className="bg-card rounded-2xl p-5 shadow-soft text-center relative">
              <div className="w-12 h-12 rounded-xl gradient-golden flex items-center justify-center mx-auto mb-3">
                <step.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="absolute top-3 right-3 text-xs font-bold text-primary/40">{i + 1}</div>
              <h3 className="font-bold text-foreground mb-1 text-sm">{step.title}</h3>
              <p className="text-xs text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/pridat" className="inline-flex items-center gap-2 gradient-golden text-primary-foreground px-8 py-4 rounded-full font-bold shadow-golden text-lg active:scale-95 transition-transform">
            <PawPrint className="w-5 h-5" /> Pridať psa ZADARMO
          </Link>
        </div>
      </section>

      {/* Výhry */}
      <section className="container mx-auto px-4 pb-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">🏆 Čo získa víťaz</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Víťaz s najviac hlasmi získa</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {prizes.map((prize) => (
            <div key={prize.title} className="bg-card rounded-2xl p-6 shadow-soft text-center">
              <div className="w-14 h-14 rounded-xl gradient-golden flex items-center justify-center mx-auto mb-4">
                <prize.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-foreground mb-1">{prize.title}</h3>
              <p className="text-sm text-muted-foreground">{prize.desc}</p>
            </div>
          ))}
        </div>
      </section>




      {/* Top dogs */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">🔥 Najobľúbenejšie psy</h2>
            <p className="text-muted-foreground mt-2">Títo psi majú najviac hlasov v aktuálnej súťaži</p>
          </div>
          <Link to="/galeria" className="hidden md:flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
            Zobraziť všetkých <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {topDogs.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {topDogs.map((dog) => <DogCard key={dog.id} dog={dog} userVoted={userVotes.includes(dog.id)} />)}
          </div>
        ) : (
          <div className="text-center py-16"><p className="text-muted-foreground text-lg">Zatiaľ žiadni psi v súťaži. Buďte prvý!</p></div>
        )}
        <Link to="/galeria" className="md:hidden flex items-center justify-center gap-2 mt-6 text-primary font-semibold">
          Zobraziť všetkých <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Newest dogs */}
      {newestDogs.length > 0 && (
        <section className="container mx-auto px-4 pb-12">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">🆕 Najnovšie pridaní</h2>
              <p className="text-muted-foreground mt-2">Čerstvo pridaní psi čakajú na vaše hlasy</p>
            </div>
            <Link to="/galeria" className="hidden md:flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
              Zobraziť všetkých <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {newestDogs.map((dog) => <DogCard key={dog.id} dog={dog} userVoted={userVotes.includes(dog.id)} />)}
          </div>
          <Link to="/galeria" className="md:hidden flex items-center justify-center gap-2 mt-6 text-primary font-semibold">
            Zobraziť všetkých <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      )}

      {/* Pravidlá */}
      <section className="container mx-auto px-4 pb-12">
        <div className="bg-card rounded-2xl p-6 md:p-10 shadow-soft max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6 text-center">Pravidlá súťaže</h2>
          <ul className="space-y-3 max-w-xl mx-auto">
            {rules.map((rule) => (
              <li key={rule} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span className="text-foreground">{rule}</span>
              </li>
            ))}
          </ul>
          <div className="text-center mt-6">
            <Link to="/pravidla" className="text-primary font-semibold hover:underline">Zobraziť všetky pravidlá →</Link>
          </div>
        </div>
      </section>

      {/* Transparentnosť */}
      <section className="container mx-auto px-4 pb-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">Transparentnosť</h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Pomáhame otvorene, zodpovedne a verejne auditovateľne</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {transparency.map((item) => (
            <div key={item.title} className="bg-card rounded-2xl p-6 shadow-soft text-center">
              <div className="w-14 h-14 rounded-xl gradient-golden flex items-center justify-center mx-auto mb-4">
                <item.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/transparentnost" className="inline-flex items-center gap-2 text-primary font-semibold hover:underline">
            Zobraziť všetky zverejnené záznamy <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* O projekte */}
      <section id="o-projekte" className="container mx-auto px-4 pb-12 scroll-mt-20">
        <div className="bg-card rounded-2xl p-6 md:p-10 shadow-soft border border-primary/10 max-w-3xl mx-auto text-center">
          <PawPrint className="w-10 h-10 text-primary mx-auto mb-3" />
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">O projekte</h2>
          <p className="text-muted-foreground text-pretty mb-3">
            Projekt <strong className="text-foreground">NajkrajšíPes.sk</strong> vytvorila <strong className="text-foreground">Zuzana Biháriová</strong>.
          </p>
          <p className="text-muted-foreground text-pretty mb-3">
            Ide o slovenskú online súťaž pre majiteľov psov, kde môžu registrovať svojho psa a zapojiť ho do verejného hlasovania.
          </p>
          <p className="text-muted-foreground text-pretty">
            Cieľom projektu je budovanie komunity milovníkov psov na Slovensku a transparentná pomoc útulkom pre zvieratá. Z každej registrácie ide 20 % na útulky. 🐾
          </p>
          <p className="text-sm font-medium text-foreground mt-4">Organizátor projektu: Zuzana Biháriová</p>
        </div>
      </section>


      {/* Shelters we support (featured shown above, so excluded here to avoid duplication) */}
      <SheltersSection respectVisibility excludeFeatured />


      {/* Partners */}
      <PartnersSection compact />

      {/* Podporte vznik projektu – Donio */}
      <section className="container mx-auto px-4 pb-12">
        <div className="bg-card rounded-3xl p-6 md:p-10 shadow-elevated border border-primary/10 max-w-3xl mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">❤️🐾 Podporte vznik projektu NajkrajšíPes.sk</h2>
            <p className="text-muted-foreground text-pretty mb-3">
              Pomôžte nám vybudovať slovenskú platformu pre milovníkov psov, ktorá spája komunitu a zároveň podporuje útulky pre zvieratá.
            </p>
            <p className="text-foreground font-medium text-pretty mb-3">
              Počas kampane na Donio je registrácia psa do súťaže úplne ZADARMO.
            </p>
            <p className="text-muted-foreground text-pretty">
              Ak sa vám projekt páči, môžete nás podporiť priamo cez našu Donio kampaň.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden bg-secondary/30">
            <iframe
              src="https://donio.sk/widget2/17673"
              title="Donio kampaň NajkrajšíPes.sk"
              width="100%"
              height="600"
              className="w-full border-0"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="gradient-golden rounded-3xl p-10 md:p-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">Zapojte sa do súťaže</h2>
          <p className="text-primary-foreground/90 mb-8 max-w-lg mx-auto text-pretty">
            Počas kampane na Donio môžete pridať svojho miláčika zadarmo. Po skončení kampane bude registrácia 2,99 €, pričom 20 % z každej platenej registrácie bude venovaných útulkom ❤️
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/pridat" className="inline-flex items-center gap-2 bg-card text-card-foreground px-8 py-4 rounded-full font-bold shadow-elevated text-lg hover:shadow-golden active:scale-95 transition-all">
              <PawPrint className="w-5 h-5" /> Pridať psa ZADARMO
            </Link>
            <Link to="/galeria" className="inline-flex items-center gap-2 bg-foreground/10 backdrop-blur-sm text-primary-foreground border border-primary-foreground/40 px-8 py-4 rounded-full font-bold text-lg hover:bg-foreground/20 active:scale-95 transition-all">
              <Vote className="w-5 h-5" /> Hlasovať v súťaži
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
