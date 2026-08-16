import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Download, ArrowLeft, PawPrint } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const PLACE_LABEL: Record<number, string> = {
  1: "1. miesto — Najkrajší pes Slovenska",
  2: "2. miesto",
  3: "3. miesto",
};

const Certificate = () => {
  const { id } = useParams();

  const { data: dog, isLoading } = useQuery({
    queryKey: ["certificate-dog", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("dogs")
        .select("*")
        .eq("id", id!)
        .eq("is_winner", true)
        .maybeSingle();
      return data;
    },
  });

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Načítavam…</div>;
  }

  if (!dog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="text-muted-foreground">Certifikát nie je k dispozícii — tento pes nie je víťazom.</p>
        <Link to="/vitazi" className="text-primary font-semibold hover:underline">← Späť na víťazov</Link>
      </div>
    );
  }

  const place = (dog as any).winner_place || 1;
  const dateStr = new Date(dog.created_at).toLocaleDateString("sk");

  return (
    <div className="min-h-screen bg-muted/40 py-8 px-4 flex flex-col items-center">
      {/* Toolbar — hidden when printing */}
      <div className="w-full max-w-3xl flex items-center justify-between mb-6 print:hidden">
        <Link to="/vitazi" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Späť
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full gradient-golden text-primary-foreground font-semibold shadow-golden hover:opacity-90 transition"
        >
          <Download className="w-4 h-4" /> Stiahnuť / Vytlačiť certifikát
        </button>
      </div>

      {/* Certificate */}
      <div className="w-full max-w-3xl bg-card rounded-3xl shadow-elevated print:shadow-none overflow-hidden">
        <div className="m-3 md:m-5 border-4 border-primary/40 rounded-2xl p-8 md:p-12 text-center relative">
          <div className="absolute inset-0 pointer-events-none opacity-[0.04] flex items-center justify-center">
            <PawPrint className="w-72 h-72" />
          </div>

          <div className="relative">
            <div className="w-16 h-16 rounded-2xl gradient-golden flex items-center justify-center mx-auto mb-4 shadow-golden">
              <Trophy className="w-8 h-8 text-primary-foreground" />
            </div>
            <p className="text-xs md:text-sm tracking-[0.3em] uppercase text-muted-foreground">Digitálny certifikát</p>
            <h1 className="text-2xl md:text-4xl font-bold text-foreground mt-2">NajkrajšíPes.eu</h1>

            <div className="my-8 md:my-10">
              <p className="text-muted-foreground">Tento certifikát sa udeľuje psíkovi</p>
              <p className="text-3xl md:text-5xl font-bold text-primary mt-2">{dog.name}</p>
              <p className="text-muted-foreground mt-2">{dog.breed} · {dog.age}</p>
            </div>

            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 text-primary font-semibold">
              <Trophy className="w-4 h-4" /> {PLACE_LABEL[place] || `${place}. miesto`}
            </div>

            <img
              src={dog.image_url}
              alt={dog.name}
              className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-2xl mx-auto mt-8 ring-4 ring-primary/30"
            />

            <p className="text-sm text-muted-foreground mt-8 max-w-md mx-auto leading-relaxed">
              Za výnimočnú účasť v charitatívnej súťaži o najkrajšieho psa Slovenska, kde 20 % z každej
              registrácie a nákupu pomáha opusteným zvieratám v útuľkoch.
            </p>

            <div className="flex items-center justify-between mt-10 pt-6 border-t border-border text-left">
              <div>
                <p className="text-xs text-muted-foreground">Dátum</p>
                <p className="text-sm font-semibold text-foreground">{dateStr}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Organizátor</p>
                <p className="text-sm font-semibold text-foreground">NajkrajšíPes.eu</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
