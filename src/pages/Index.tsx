import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Users, Trophy, ArrowRight, Award, Gift } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import heroImg from "@/assets/hero-dog.jpg";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DogCard from "@/components/DogCard";
import DonationCounter from "@/components/DonationCounter";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user } = useAuth();

  const { data: dogs = [] } = useQuery({
    queryKey: ["top-dogs"],
    queryFn: async () => {
      const { data: dogsData } = await supabase.from("dogs").select("*").eq("approved", true).order("created_at", { ascending: false });
      if (!dogsData) return [];
      const ownerIds = [...new Set(dogsData.map((d) => d.owner_id))];
      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name").in("user_id", ownerIds);
      const profileMap: Record<string, string> = {};
      profiles?.forEach((p) => { profileMap[p.user_id] = p.display_name || "Neznámy"; });
      const { data: voteCounts } = await supabase.from("votes").select("dog_id");
      const voteMap: Record<string, number> = {};
      voteCounts?.forEach((v) => { voteMap[v.dog_id] = (voteMap[v.dog_id] || 0) + 1; });
      return dogsData.map((d) => ({
        id: d.id, name: d.name, breed: d.breed, age: d.age, image_url: d.image_url,
        highlighted: d.highlighted, owner_name: profileMap[d.owner_id] || "Neznámy", votes: voteMap[d.id] || 0,
      })).sort((a, b) => b.votes - a.votes).slice(0, 3);
    },
  });

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
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Krásny pes" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
        </div>
        <div className="relative container mx-auto px-4 py-24 md:py-40">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="max-w-xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-background mb-6">Ktorý pes si dnes získa vaše srdce?</h1>
            <p className="text-lg md:text-xl text-background/80 mb-8 text-pretty">Pridajte svojho miláčika do súťaže a získajte hlasy od tisícov milovníkov psov po celom Slovensku.</p>
            <div className="flex flex-wrap gap-3">
              <Link to="/galeria">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} className="gradient-golden text-primary-foreground px-8 py-4 rounded-full font-bold shadow-golden flex items-center gap-2 text-lg">
                  Preskúmať galériu <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
              <Link to="/pridat">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} className="bg-background/20 backdrop-blur-sm text-background border border-background/30 px-8 py-4 rounded-full font-bold flex items-center gap-2 text-lg hover:bg-background/30 transition-colors">
                  Pridať psa
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {statItems.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }} className="bg-card rounded-2xl p-6 shadow-elevated flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl gradient-golden flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold tabular-nums text-card-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Prize section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">🏆 Čo môže pes vyhrať</h2>
          <p className="text-muted-foreground mt-2">Víťaz súťaže každý mesiac získa</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          {prizes.map((prize, i) => (
            <motion.div key={prize.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
              className="bg-card rounded-2xl p-6 shadow-soft text-center">
              <div className="w-14 h-14 rounded-xl gradient-golden flex items-center justify-center mx-auto mb-4">
                <prize.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="font-bold text-foreground mb-1">{prize.title}</h3>
              <p className="text-sm text-muted-foreground">{prize.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Donation counter */}
      <DonationCounter />

      {/* E-shop banner */}
      <section className="container mx-auto px-4 pb-8">
        <Link to="/eshop">
          <motion.div whileHover={{ scale: 1.01 }} className="bg-card rounded-2xl p-8 shadow-soft text-center border-2 border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
            <p className="text-2xl md:text-3xl font-bold text-foreground mb-2">🛒 Navštívte náš e-shop a podporte útulky!</p>
            <p className="text-muted-foreground">Časť výťažku z každého nákupu venujeme útulkom pre zvieratá ❤️</p>
          </motion.div>
        </Link>
      </section>

      {/* Donate CTA */}
      <section className="container mx-auto px-4 pb-8">
        <Link to="/podporit">
          <motion.div whileHover={{ scale: 1.01 }} className="gradient-golden rounded-2xl p-8 shadow-golden text-center cursor-pointer">
            <p className="text-2xl md:text-3xl font-bold text-primary-foreground mb-2">Podporiť útulky ❤️</p>
            <p className="text-primary-foreground/80">Nemáte psíka? Aj tak môžete pomôcť jednorazovým príspevkom 1 €, 3 € alebo 5 € 🐶❤️</p>
          </motion.div>
        </Link>
      </section>

      <section className="container mx-auto px-4 pb-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Najobľúbenejší psy</h2>
            <p className="text-muted-foreground mt-2">Títo psy majú najviac hlasov v aktuálnej súťaži</p>
          </div>
          <Link to="/galeria" className="hidden md:flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
            Zobraziť všetkých <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {dogs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {dogs.map((dog) => <DogCard key={dog.id} dog={dog} userVoted={userVotes.includes(dog.id)} />)}
          </div>
        ) : (
          <div className="text-center py-16"><p className="text-muted-foreground text-lg">Zatiaľ žiadni psy v súťaži. Buďte prvý!</p></div>
        )}
        <Link to="/galeria" className="md:hidden flex items-center justify-center gap-2 mt-8 text-primary font-semibold">
          Zobraziť všetkých <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      <section className="container mx-auto px-4 pb-20">
        <div className="gradient-golden rounded-3xl p-10 md:p-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">Zapojiť sa do súťaže</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto text-pretty">Pridajte profil vášho psa za 1 € a zapojte sa do súťaže o najkrajšieho psa. Z každého príspevku pomáhate aj útulkom pre zvieratá ❤️ Po ukončení súťaže zverejníme sumu, ktorú venujeme útulkom.</p>
          <Link to="/pridat">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }} className="bg-card text-card-foreground px-8 py-4 rounded-full font-bold shadow-elevated text-lg hover:shadow-golden transition-shadow">
              Pridať psa za 1 €
            </motion.button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
