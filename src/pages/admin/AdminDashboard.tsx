import { Users, Dog, Heart, UserPlus, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const stats = [
  { label: "Používateľov", value: "1,247", icon: Users, change: "+12%" },
  { label: "Psov v súťaži", value: "486", icon: Dog, change: "+8%" },
  { label: "Celkom hlasov", value: "24,891", icon: Heart, change: "+23%" },
  { label: "Nové registrácie (7d)", value: "89", icon: UserPlus, change: "+15%" },
];

const recentUsers = [
  { name: "Mária K.", email: "maria@email.sk", date: "2025-03-14" },
  { name: "Peter N.", email: "peter@email.sk", date: "2025-03-13" },
  { name: "Jana S.", email: "jana@email.sk", date: "2025-03-12" },
  { name: "Tomáš B.", email: "tomas@email.sk", date: "2025-03-11" },
];

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-2xl p-5 shadow-soft"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex items-center gap-1 text-xs font-medium text-green-600">
                <TrendingUp className="w-3 h-3" />
                {stat.change}
              </div>
            </div>
            <p className="text-2xl font-bold tabular-nums text-card-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent users */}
      <div className="bg-card rounded-2xl shadow-soft">
        <div className="p-5 border-b border-border">
          <h3 className="font-bold text-foreground">Posledné registrácie</h3>
        </div>
        <div className="divide-y divide-border">
          {recentUsers.map((user) => (
            <div key={user.email} className="px-5 py-3 flex items-center justify-between hover:bg-secondary/30 transition-colors">
              <div>
                <p className="font-medium text-sm text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <span className="text-xs text-muted-foreground">{user.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
