import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ShoppingBag } from "lucide-react";
import { Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const MyOrders = () => {
  const { user, loading } = useAuth();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  if (!loading && !user) return <Navigate to="/prihlasenie" replace />;

  const statusLabel = (s: string) => {
    switch (s) {
      case "completed": return { text: "Zaplatené", cls: "bg-green-100 text-green-700" };
      case "pending": return { text: "Čaká sa", cls: "bg-yellow-100 text-yellow-700" };
      default: return { text: s, cls: "bg-secondary text-muted-foreground" };
    }
  };

  const typeLabel = (t: string) => {
    switch (t) {
      case "registration": return "Registrácia psa";
      case "highlight": return "Zvýraznenie";
      case "product": return "E-shop nákup";
      default: return t;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="gradient-golden py-10 text-center">
        <ShoppingBag className="w-10 h-10 text-primary-foreground mx-auto mb-3" />
        <h1 className="text-3xl font-extrabold text-primary-foreground">Moje objednávky</h1>
      </section>

      <section className="container mx-auto px-4 py-8 flex-1">
        {isLoading ? (
          <p className="text-center text-muted-foreground py-16">Načítavam...</p>
        ) : orders.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">Zatiaľ žiadne objednávky.</p>
        ) : (
          <div className="space-y-3 max-w-2xl mx-auto">
            {orders.map((o) => {
              const st = statusLabel(o.status);
              return (
                <div key={o.id} className="bg-card rounded-2xl p-5 border border-border flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground">{typeLabel(o.type)}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleDateString("sk-SK", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-foreground">{(o.amount / 100).toFixed(2)} €</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${st.cls}`}>{st.text}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
};

export default MyOrders;
