import { Users, Dog, Heart, UserPlus, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [{ count: users }, { count: dogs }, { count: votes }, { data: recentProfiles }] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("dogs").select("*", { count: "exact", head: true }),
        supabase.from("votes").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("display_name, user_id, created_at").order("created_at", { ascending: false }).limit(5),
      ]);
      return {
        users: users || 0,
        dogs: dogs || 0,
        votes: votes || 0,
        recentUsers: recentProfiles || [],
      };
    },
  });

  const statItems = [
    { label: "Používateľov", value: stats?.users || 0, icon: Users },
    { label: "Psov v súťaži", value: stats?.dogs || 0, icon: Dog },
    { label: "Celkom hlasov", value: stats?.votes || 0, icon: Heart },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statItems.map((stat, i) => (
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
            </div>
            <p className="text-2xl font-bold tabular-nums text-card-foreground">{stat.value.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-card rounded-2xl shadow-soft">
        <div className="p-5 border-b border-border">
          <h3 className="font-bold text-foreground">Posledné registrácie</h3>
        </div>
        <div className="divide-y divide-border">
          {stats?.recentUsers.map((user) => (
            <div key={user.user_id} className="px-5 py-3 flex items-center justify-between hover:bg-secondary/30 transition-colors">
              <div>
                <p className="font-medium text-sm text-foreground">{user.display_name || "Bez mena"}</p>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(user.created_at).toLocaleDateString("sk")}
              </span>
            </div>
          ))}
          {(!stats?.recentUsers || stats.recentUsers.length === 0) && (
            <p className="px-5 py-6 text-center text-muted-foreground text-sm">Žiadne registrácie</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
