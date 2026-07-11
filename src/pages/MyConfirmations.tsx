import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Receipt, CheckCircle, Clock, XCircle, Mail, MailX, MailWarning, LogIn } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const typeLabels: Record<string, string> = {
  registration: "Registrácia psa",
  donation: "Príspevok útulku",
  platform_support: "Podpora platformy",
  highlight: "Zvýraznenie psa",
  product: "Nákup produktu",
};

const MyConfirmations = () => {
  const { user, loading } = useAuth();

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["my-confirmations", user?.id],
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-10 max-w-4xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl gradient-golden flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Moje potvrdenia</h1>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-pretty">
            Prehľad vašich platieb — registrácie psov aj podpory útulkov — vrátane sumy, stavu platby a odoslania e-mailového potvrdenia.
          </p>
        </div>

        {!user && !loading ? (
          <div className="bg-card rounded-2xl p-10 text-center shadow-soft border border-border">
            <p className="text-muted-foreground text-pretty mb-4">Pre zobrazenie potvrdení sa musíte prihlásiť.</p>
            <Link to="/prihlasenie" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold gradient-golden text-primary-foreground shadow-golden">
              <LogIn className="w-4 h-4" /> Prihlásiť sa
            </Link>
          </div>
        ) : isLoading || loading ? (
          <p className="text-center text-muted-foreground py-16">Načítavam...</p>
        ) : payments.length === 0 ? (
          <div className="bg-card rounded-2xl p-10 text-center shadow-soft border border-border">
            <p className="text-muted-foreground text-pretty">Zatiaľ nemáte žiadne platby.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((p: any) => {
              const paid = p.status === "completed";
              const pending = p.status === "pending";
              const emailSent = p.confirmation_email_sent;
              const emailError = p.confirmation_email_error;
              return (
                <div key={p.id} className="bg-card rounded-2xl p-5 shadow-soft border border-border">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-foreground">{typeLabels[p.type] || p.type}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {p.product_name || p.item_name || "—"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(p.created_at).toLocaleString("sk")}
                      </p>
                    </div>
                    <p className="text-xl font-bold tabular-nums text-foreground">{(p.amount / 100).toFixed(2)} €</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                      paid ? "bg-green-100 text-green-700" : pending ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                    }`}>
                      {paid ? <CheckCircle className="w-3.5 h-3.5" /> : pending ? <Clock className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {paid ? "Zaplatené" : pending ? "Čaká na spracovanie" : "Zlyhalo"}
                    </span>

                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                      emailSent ? "bg-green-100 text-green-700" : emailError ? "bg-red-100 text-red-700" : "bg-secondary text-muted-foreground"
                    }`}>
                      {emailSent ? <Mail className="w-3.5 h-3.5" /> : emailError ? <MailX className="w-3.5 h-3.5" /> : <MailWarning className="w-3.5 h-3.5" />}
                      {emailSent ? "E-mail odoslaný" : emailError ? "E-mail zlyhal" : "E-mail čaká"}
                    </span>
                  </div>

                  {emailSent && p.confirmation_email_at && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Potvrdenie odoslané: {new Date(p.confirmation_email_at).toLocaleString("sk")}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MyConfirmations;
