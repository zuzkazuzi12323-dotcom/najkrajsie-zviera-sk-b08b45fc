import { Link } from "react-router-dom";
import { Heart, Users, Trophy, ArrowRight, Award, Gift, Clock, Sparkles, PawPrint } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import heroImg from "@/assets/hero-dog.jpg";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DogCard from "@/components/DogCard";
import DonationCounter from "@/components/DonationCounter";
import ContestCountdown from "@/components/ContestCountdown";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const fetchDogsWithVotes = async () => {
  const { data: dogsData } = await supabase.from("dogs").select("*").eq("approved", true);
  if (!dogsData?.length) return [];
  const ownerIds = [...new Set(dogsData.map((d) => d.owner_id))];
  const [{ data: profiles }, { data: voteCounts }] = await Promise.all([
    supabase.from("profiles").select("user_id, display_name").in("user_id", ownerIds),
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
  }));
};

const Index = () => {
  const { user } = useAuth();

  const { data: allDogs = [] } = useQuery({
    queryKey: ["all-dogs-home"],
    queryFn: fetchDogsWithVotes,
  });

  const topDogs = [...allDogs].sort((a, b) => b.votes - a.votes).slice(0, 6);
  const newestDogs = [...allDogs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6);

  const { data: userVotes = [] } = useQuery({
    queryKey: ["user-votes", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("votes").select("dog_id").eq("user_id", user!.id);
      return data?.map((v) => v.dog_id) || [];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: async () => {
      const [{ count: dogCount }, { count: voteCount }, { count: userCount }] = await Promise.all([
        supabase.from("dogs").select("*", { count: "exact", head: true }),
        supabase.from("votes").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
      ]);
      return { dogs: dogCount || 0, votes: voteCount || 0, users: userCount || 0 };
    },
  });

  const statItems = [
    { icon: Heart, label: "Celkom hlasov", value: stats?.votes?.toLocaleString() || "0" },
    { icon: Users, label: "Súťažiacich psov", value: stats?.dogs?.toLocaleString() || "0" },
    { icon: Trophy, label: "Registrovaných", value: stats?.users?.toLocaleString() || "0" },
  ];

  const prizes = [
    { icon: Trophy, title: "Titul Najkrajší pes Slovenska", desc: "Prestížne ocenenie pre vášho miláčika" },
    { icon: Award, title: "Digitálny diplom", desc: "Krásny certifikát na stiahnutie" },
    { icon: Gift, title: "Darček pre psa", desc: "Hračka alebo pamlsky pre víťaza" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Krásny pes" className="w-full h-full object-cover" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
        </div>
        <div className="relative container mx-auto px-4 py-24 md:py-40">
          <div className="max-w-xl animate-fade-in">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">Najväčšia súťaž krásy psov</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-background mb-6 leading-tight">
              Každý pes si zaslúži <span className="text-primary">svoju chvíľu slávy</span>
            </h1>
            <p className="text-lg md:text-xl text-background/80 mb-8 text-pretty">
              Pridajte svojho miláčika za 1 € a zapojte sa do súťaže. Každý príspevok pomáha útulkom pre zvieratá ❤️ Môžete pridať aj viac psíkov!
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/podporit" className="gradient-golden text-primary-foreground px-8 py-4 rounded-full font-bold shadow-golden flex items-center gap-2 text-lg active:scale-95 transition-transform">
                Podporiť útulky ❤️ <Heart className="w-5 h-5" />
              </Link>
              <Link to="/pridat" className="bg-background/20 backdrop-blur-sm text-background border border-background/30 px-8 py-4 rounded-full font-bold flex items-center gap-2 text-lg hover:bg-background/30 active:scale-95 transition-all">
                <PawPrint className="w-5 h-5" /> Pridať psa za 1 €
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

      {/* Contest Countdown */}
      <ContestCountdown />

      {/* Trust section */}
      <section className="container mx-auto px-4 py-10">
        <div className="bg-card rounded-2xl p-6 md:p-8 shadow-soft border border-primary/10 text-center">
          <PawPrint className="w-10 h-10 text-primary mx-auto mb-3" />
          <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">Prečo sa zapojiť?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-pretty mb-6">
            Každý zaregistrovaný psík dostáva šancu získať titul <strong className="text-foreground">Najkrajší pes Slovenska</strong>. 
            Z každého 1 € venujeme 20 % na pomoc opusteným zvieratkám v útulkoch. Spolu tvoríme lepší svet pre naše štvornohé kamarátstva. 🐾
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Heart className="w-4 h-4 text-primary fill-primary" />
              <span>Transparentné financovanie</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Trophy className="w-4 h-4 text-primary" />
              <span>Mesačné vyhodnotenie</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <PawPrint className="w-4 h-4 text-primary" />
              <span>Pomáhame útulkom</span>
            </div>
          </div>
        </div>
      </section>

      {/* Prize section */}
      <section className="container mx-auto px-4 pb-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">🏆 Čo môže pes vyhrať</h2>
          <p className="text-muted-foreground mt-2">Víťaz súťaže každý mesiac získa</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
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

      {/* Donation counter */}
      <DonationCounter />

      {/* E-shop banner */}
      <section className="container mx-auto px-4 pb-8">
        <Link to="/eshop">
          <div className="bg-card rounded-2xl p-8 shadow-soft text-center border-2 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
            <p className="text-2xl md:text-3xl font-bold text-foreground mb-2">🛒 Navštívte náš e-shop a podporte útulky!</p>
            <p className="text-muted-foreground">Časť výťažku z každého nákupu venujeme útulkom pre zvieratá ❤️</p>
          </div>
        </Link>
      </section>

      {/* Donate CTA */}
      <section className="container mx-auto px-4 pb-8">
        <Link to="/podporit">
          <div className="gradient-golden rounded-2xl p-8 shadow-golden text-center cursor-pointer hover:opacity-95 transition-opacity">
            <p className="text-2xl md:text-3xl font-bold text-primary-foreground mb-2">Podporiť útulky ❤️</p>
            <p className="text-primary-foreground/80">Nemáte psíka? Aj tak môžete pomôcť jednorazovým príspevkom 1 €, 3 € alebo 5 € 🐶❤️</p>
          </div>
        </Link>
      </section>

      {/* Top dogs */}
      <section className="container mx-auto px-4 pb-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">🔥 Najobľúbenejší psy</h2>
            <p className="text-muted-foreground mt-2">Títo psy majú najviac hlasov v aktuálnej súťaži</p>
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
          <div className="text-center py-16"><p className="text-muted-foreground text-lg">Zatiaľ žiadni psy v súťaži. Buďte prvý!</p></div>
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
              <p className="text-muted-foreground mt-2">Čerstvo pridaní psy čakajú na vaše hlasy</p>
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

      {/* Final CTA */}
      <section className="container mx-auto px-4 pb-20">
        <div className="gradient-golden rounded-3xl p-10 md:p-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">Zapojiť sa do súťaže</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto text-pretty">
            Pridajte profil vášho psa za 1 € a zapojte sa do súťaže o najkrajšieho psa. Môžete pridať aj viac psíkov – každý za 1 €! Z každého príspevku pomáhame útulkom pre zvieratá ❤️
          </p>
          <Link to="/pridat" className="inline-block bg-card text-card-foreground px-8 py-4 rounded-full font-bold shadow-elevated text-lg hover:shadow-golden active:scale-95 transition-all">
            Pridať psa za 1 €
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
