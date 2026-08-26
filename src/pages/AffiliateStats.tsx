import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Copy, Link2, MousePointerClick, PawPrint, Wallet } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

const AffiliateStats = () => {
  const { code = "" } = useParams();

  useEffect(() => {
    document.title = `Partnerské štatistiky ${code} – NajkrajšíPes.eu`;
  }, [code]);

  const { data, isLoading } = useQuery({
    queryKey: ["affiliate-stats", code],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("affiliate_stats", { _code: code });
      if (error) throw error;
      return (data as any[])?.[0] || null;
    },
    enabled: !!code,
  });

  const link = `https://najkrajsipes.eu?ref=${code}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Odkaz skopírovaný");
    } catch {
      toast.error("Kopírovanie sa nepodarilo");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 py-10 max-w-3xl flex-1">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Partnerské štatistiky</h1>
        <p className="text-muted-foreground mb-8 break-words">Kód: <strong>{code}</strong></p>

        {isLoading && <p className="text-muted-foreground">Načítavam…</p>}

        {!isLoading && !data && (
          <div className="bg-card rounded-2xl p-6 shadow-soft">
            <p className="text-foreground">Tento partnerský kód neexistuje alebo už nie je aktívny.</p>
          </div>
        )}

        {data && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-card rounded-2xl p-5 shadow-soft">
                <MousePointerClick className="w-5 h-5 text-primary mb-2" />
                <p className="text-2xl font-bold text-foreground">{data.clicks ?? 0}</p>
                <p className="text-sm text-muted-foreground">Kliky na odkaz</p>
              </div>
              <div className="bg-card rounded-2xl p-5 shadow-soft">
                <PawPrint className="w-5 h-5 text-primary mb-2" />
                <p className="text-2xl font-bold text-foreground">{data.registrations ?? 0}</p>
                <p className="text-sm text-muted-foreground">Registrácie psov</p>
              </div>
              <div className="bg-card rounded-2xl p-5 shadow-soft">
                <Wallet className="w-5 h-5 text-primary mb-2" />
                <p className="text-2xl font-bold text-foreground">
                  {(((data.earnings_cents ?? 0) as number) / 100).toFixed(2).replace(".", ",")} €
                </p>
                <p className="text-sm text-muted-foreground">
                  Zárobok — {data.paid ? "vyplatené" : "nevyplatené"}
                </p>
              </div>
            </div>

            <div className="bg-card rounded-2xl p-6 shadow-soft">
              <h2 className="font-bold text-foreground mb-2 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-primary" /> Váš partnerský odkaz
              </h2>
              <p className="text-sm text-muted-foreground break-all mb-3">{link}</p>
              <button onClick={copy} className="gradient-golden text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold inline-flex items-center gap-2">
                <Copy className="w-4 h-4" /> Kopírovať odkaz
              </button>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AffiliateStats;
