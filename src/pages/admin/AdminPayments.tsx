import { useState } from "react";
import { CreditCard, Award, CheckCircle } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminPayments = () => {
  const queryClient = useQueryClient();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: async () => {
      const { data: payments } = await supabase.from("payments").select("*").order("created_at", { ascending: false });
      if (!payments) return { items: [], totalRevenue: 0, highlightedCount: 0, pendingCount: 0 };

      const userIds = [...new Set(payments.map((p) => p.user_id))];
      const dogIds = payments.map((p) => p.dog_id).filter(Boolean) as string[];

      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name").in("user_id", userIds);
      const { data: dogs } = dogIds.length > 0
        ? await supabase.from("dogs").select("id, name").in("id", dogIds)
        : { data: [] };

      const profileMap: Record<string, string> = {};
      profiles?.forEach((p) => { profileMap[p.user_id] = p.display_name || "Neznámy"; });
      const dogMap: Record<string, string> = {};
      dogs?.forEach((d) => { dogMap[d.id] = d.name; });

      const items = payments.map((p) => ({
        ...p,
        user_name: profileMap[p.user_id] || "Neznámy",
        dog_name: p.dog_id ? (dogMap[p.dog_id] || "-") : "-",
      }));

      const totalRevenue = items.filter((p) => p.status === "completed").reduce((sum, p) => sum + p.amount, 0);
      const highlightedCount = items.filter((p) => p.type === "highlight" && p.status === "completed").length;
      const pendingCount = items.filter((p) => p.status === "pending").length;

      return { items, totalRevenue, highlightedCount, pendingCount };
    },
  });

  const approvePayment = async (payment: any) => {
    setLoadingId(payment.id);
    try {
      // Update payment status
      const { error } = await supabase.from("payments").update({ status: "completed" }).eq("id", payment.id);
      if (error) throw error;

      // If it's a registration payment, approve the dog
      if (payment.type === "registration" && payment.dog_id) {
        await supabase.from("dogs").update({ approved: true }).eq("id", payment.dog_id);
      }

      // Add donation (20%)
      await supabase.rpc("add_donation", { payment_amount: payment.amount });

      toast.success("Platba schválená");
      queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dogs"] });
    } catch {
      toast.error("Nepodarilo sa schváliť platbu");
    } finally {
      setLoadingId(null);
    }
  };

  const typeLabels: Record<string, string> = {
    highlight: "Zvýraznenie",
    registration: "Registrácia",
    product: "E-shop",
    donation: "Príspevok",
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl p-5 shadow-soft flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums text-card-foreground">{((data?.totalRevenue || 0) / 100).toFixed(2)} €</p>
            <p className="text-sm text-muted-foreground">Celkové príjmy</p>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-5 shadow-soft flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums text-card-foreground">{data?.pendingCount || 0}</p>
            <p className="text-sm text-muted-foreground">Čakajúce platby</p>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-5 shadow-soft flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Award className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums text-card-foreground">{data?.highlightedCount || 0}</p>
            <p className="text-sm text-muted-foreground">Zvýraznení psy</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-soft overflow-hidden">
        <div className="p-5 border-b border-border">
          <h3 className="font-bold text-foreground">Prehľad platieb</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Používateľ</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Typ</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Pes / Produkt</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Suma</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Stav</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Dátum</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Akcia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.items.map((payment) => (
                <tr key={payment.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-foreground">{payment.user_name}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      payment.type === "highlight" ? "bg-primary/10 text-primary" :
                      payment.type === "product" ? "bg-blue-100 text-blue-700" :
                      payment.type === "donation" ? "bg-pink-100 text-pink-700" :
                      "bg-secondary text-secondary-foreground"
                    }`}>
                      {typeLabels[payment.type] || payment.type}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">
                    {payment.product_name || payment.dog_name}
                  </td>
                  <td className="px-5 py-3 text-sm tabular-nums font-medium text-foreground">{(payment.amount / 100).toFixed(2)} €</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      payment.status === "completed" ? "bg-green-100 text-green-700" :
                      payment.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                    }`}>
                      {payment.status === "completed" ? "Zaplatené" : payment.status === "pending" ? "Čaká" : "Zlyhalo"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{new Date(payment.created_at).toLocaleDateString("sk")}</td>
                  <td className="px-5 py-3 text-right">
                    {payment.status === "pending" && (
                      <button
                        onClick={() => approvePayment(payment)}
                        disabled={loadingId === payment.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        {loadingId === payment.id ? "..." : "Schváliť"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(!data?.items || data.items.length === 0) && <p className="text-center py-10 text-muted-foreground">Žiadne platby</p>}
      </div>
    </div>
  );
};

export default AdminPayments;
