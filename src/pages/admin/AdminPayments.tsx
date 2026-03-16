import { CreditCard, Award } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const AdminPayments = () => {
  const { data } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: async () => {
      const { data: payments } = await supabase
        .from("payments")
        .select("*, profiles!payments_user_id_fkey(display_name), dogs!payments_dog_id_fkey(name)")
        .order("created_at", { ascending: false });

      const items = payments?.map((p) => ({
        ...p,
        user_name: (p.profiles as any)?.display_name || "Neznámy",
        dog_name: (p.dogs as any)?.name || "-",
      })) || [];

      const totalRevenue = items
        .filter((p) => p.status === "completed")
        .reduce((sum, p) => sum + p.amount, 0);
      
      const highlightedCount = items.filter((p) => p.type === "highlight" && p.status === "completed").length;

      return { items, totalRevenue, highlightedCount };
    },
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl p-5 shadow-soft flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums text-card-foreground">
              {((data?.totalRevenue || 0) / 100).toFixed(2)} €
            </p>
            <p className="text-sm text-muted-foreground">Celkové príjmy</p>
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
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Pes</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Suma</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Stav</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Dátum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data?.items.map((payment) => (
                <tr key={payment.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-foreground">{payment.user_name}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      payment.type === "highlight" ? "bg-primary/10 text-primary" : "bg-secondary text-secondary-foreground"
                    }`}>
                      {payment.type === "highlight" ? "Zvýraznenie" : "Registrácia"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{payment.dog_name}</td>
                  <td className="px-5 py-3 text-sm tabular-nums font-medium text-foreground">
                    {(payment.amount / 100).toFixed(2)} €
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      payment.status === "completed" ? "bg-green-100 text-green-700" :
                      payment.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {payment.status === "completed" ? "Zaplatené" : payment.status === "pending" ? "Čaká" : "Zlyhalo"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">
                    {new Date(payment.created_at).toLocaleDateString("sk")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(!data?.items || data.items.length === 0) && (
          <p className="text-center py-10 text-muted-foreground">Žiadne platby</p>
        )}
      </div>
    </div>
  );
};

export default AdminPayments;
