import { CreditCard, Award } from "lucide-react";

const payments = [
  { id: "p1", user: "Mária K.", type: "Registrácia psa", amount: "1,00 €", date: "2025-03-14", dog: "Luna" },
  { id: "p2", user: "Peter N.", type: "Registrácia psa", amount: "1,00 €", date: "2025-03-13", dog: "Bruno" },
  { id: "p3", user: "Mária K.", type: "Zvýraznenie", amount: "2,00 €", date: "2025-03-13", dog: "Luna" },
  { id: "p4", user: "Jana S.", type: "Registrácia psa", amount: "1,00 €", date: "2025-03-12", dog: "Rex" },
  { id: "p5", user: "Jana S.", type: "Zvýraznenie", amount: "2,00 €", date: "2025-03-12", dog: "Rex" },
  { id: "p6", user: "Tomáš B.", type: "Registrácia psa", amount: "1,00 €", date: "2025-03-11", dog: "Buddy" },
];

const totalRevenue = "8,00 €";
const highlightedDogs = 2;

const AdminPayments = () => {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl p-5 shadow-soft flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums text-card-foreground">{totalRevenue}</p>
            <p className="text-sm text-muted-foreground">Celkové príjmy</p>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-5 shadow-soft flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Award className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums text-card-foreground">{highlightedDogs}</p>
            <p className="text-sm text-muted-foreground">Zvýraznení psy</p>
          </div>
        </div>
      </div>

      {/* Payments table */}
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
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Dátum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-foreground">{payment.user}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      payment.type === "Zvýraznenie" ? "bg-primary/10 text-primary" : "bg-secondary text-secondary-foreground"
                    }`}>
                      {payment.type}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{payment.dog}</td>
                  <td className="px-5 py-3 text-sm tabular-nums font-medium text-foreground">{payment.amount}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{payment.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPayments;
