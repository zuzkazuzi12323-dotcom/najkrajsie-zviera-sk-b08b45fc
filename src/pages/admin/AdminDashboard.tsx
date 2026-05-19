import { useState, useEffect, useMemo } from "react";
import { Users, Dog, Heart, CreditCard, Bell, Trophy, TrendingUp, Calendar, Power, RotateCcw, BarChart3 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminDashboard = () => {
  const queryClient = useQueryClient();

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [
        { count: users },
        { count: dogs },
        { count: votes },
        { count: todayVotes },
        { data: topDog },
        { data: recentProfiles },
        { data: pendingPayments },
        { data: contestSettings },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("dogs").select("*", { count: "exact", head: true }),
        supabase.from("votes").select("*", { count: "exact", head: true }),
        supabase.from("votes").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString()),
        supabase.from("votes").select("dog_id").then(({ data: allVotes }) => {
          if (!allVotes || allVotes.length === 0) return { data: null };
          const counts: Record<string, number> = {};
          allVotes.forEach((v) => { counts[v.dog_id] = (counts[v.dog_id] || 0) + 1; });
          const topId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
          return topId ? supabase.from("dogs").select("name, image_url").eq("id", topId[0]).single().then(r => ({ data: r.data ? { ...r.data, votes: topId[1] } : null })) : { data: null };
        }),
        supabase.from("profiles").select("display_name, user_id, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("payments").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("contest_settings").select("*").eq("id", "00000000-0000-0000-0000-000000000002").single(),
      ]);
      return {
        users: users || 0,
        dogs: dogs || 0,
        votes: votes || 0,
        todayVotes: todayVotes || 0,
        topDog: topDog as any,
        recentUsers: recentProfiles || [],
        pendingPayments: pendingPayments || 0,
        contestActive: contestSettings?.active ?? true,
        contestEndDate: contestSettings?.end_date || null,
      };
    },
  });

  // Voting analytics - last 14 days
  const { data: votingData = [] } = useQuery({
    queryKey: ["admin-voting-analytics"],
    queryFn: async () => {
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);
      fourteenDaysAgo.setHours(0, 0, 0, 0);

      const { data: votes } = await supabase
        .from("votes")
        .select("created_at, dog_id, user_id")
        .gte("created_at", fourteenDaysAgo.toISOString())
        .order("created_at", { ascending: true });

      if (!votes) return [];

      // Group by day
      const dayMap: Record<string, { total: number; uniqueUsers: Set<string>; uniqueDogs: Set<string> }> = {};
      for (let i = 0; i < 14; i++) {
        const d = new Date(fourteenDaysAgo);
        d.setDate(d.getDate() + i);
        const key = d.toISOString().slice(0, 10);
        dayMap[key] = { total: 0, uniqueUsers: new Set(), uniqueDogs: new Set() };
      }

      votes.forEach((v) => {
        const key = v.created_at.slice(0, 10);
        if (dayMap[key]) {
          dayMap[key].total++;
          dayMap[key].uniqueUsers.add(v.user_id);
          dayMap[key].uniqueDogs.add(v.dog_id);
        }
      });

      return Object.entries(dayMap).map(([date, data]) => ({
        date,
        label: new Date(date).toLocaleDateString("sk", { day: "numeric", month: "short" }),
        total: data.total,
        uniqueUsers: data.uniqueUsers.size,
        uniqueDogs: data.uniqueDogs.size,
      }));
    },
  });

  const maxVotes = useMemo(() => Math.max(...votingData.map(d => d.total), 1), [votingData]);

  // Notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: async () => {
      const { data } = await supabase
        .from("admin_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      return data || [];
    },
  });

  const unreadCount = notifications.filter((n: any) => !n.read).length;

  const markAllRead = async () => {
    const unread = notifications.filter((n: any) => !n.read).map((n: any) => n.id);
    if (unread.length === 0) return;
    await supabase.from("admin_notifications").update({ read: true }).in("id", unread);
    queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
  };

  // Contest controls
  const toggleContest = async () => {
    const newState = !stats?.contestActive;
    await supabase.from("contest_settings").update({ active: newState, updated_at: new Date().toISOString() }).eq("id", "00000000-0000-0000-0000-000000000002");
    toast.success(newState ? "Súťaž zapnutá" : "Súťaž vypnutá");
    queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
  };

  const updateEndDate = async (date: string) => {
    await supabase.from("contest_settings").update({ end_date: date || null, updated_at: new Date().toISOString() }).eq("id", "00000000-0000-0000-0000-000000000002");
    toast.success("Dátum ukončenia uložený");
    queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
  };

  const resetVotes = async () => {
    if (!confirm("Naozaj chcete resetovať VŠETKY hlasy? Túto akciu nie je možné vrátiť späť.")) return;
    const { error } = await supabase.from("votes").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) toast.error("Chyba pri resetovaní hlasov");
    else { toast.success("Všetky hlasy boli resetované"); queryClient.invalidateQueries({ queryKey: ["admin-stats"] }); }
  };

  const statItems = [
    { label: "Používateľov", value: stats?.users || 0, icon: Users },
    { label: "Psov v súťaži", value: stats?.dogs || 0, icon: Dog },
    { label: "Celkom hlasov", value: stats?.votes || 0, icon: Heart },
    { label: "Hlasov dnes", value: stats?.todayVotes || 0, icon: TrendingUp },
  ];

  // Realtime notifications
  useEffect(() => {
    const channel = supabase
      .channel("admin-notifs")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "admin_notifications" }, () => {
        queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((stat) => (
          <div key={stat.label} className="bg-card rounded-2xl p-5 shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="text-2xl font-bold tabular-nums text-card-foreground">{stat.value.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Voting Analytics Chart */}
      <div className="bg-card rounded-2xl shadow-soft p-5">
        <h3 className="font-bold text-foreground flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary" /> Hlasovanie – posledných 14 dní
        </h3>
        <div className="flex items-end gap-1 h-48">
          {votingData.map((day) => (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1 min-w-0">
              <span className="text-xs font-bold tabular-nums text-foreground">{day.total}</span>
              <div
                className="w-full rounded-t-md gradient-golden transition-all"
                style={{ height: `${Math.max((day.total / maxVotes) * 140, 4)}px` }}
                title={`${day.label}: ${day.total} hlasov, ${day.uniqueUsers} používateľov, ${day.uniqueDogs} psov`}
              />
              <span className="text-[10px] text-muted-foreground truncate w-full text-center">{day.label}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-6 mt-4 text-xs text-muted-foreground">
          <span>Priemer: <strong className="text-foreground">{votingData.length ? Math.round(votingData.reduce((s, d) => s + d.total, 0) / votingData.length) : 0}</strong> hlasov/deň</span>
          <span>Max: <strong className="text-foreground">{maxVotes}</strong> hlasov</span>
        </div>
      </div>

      {/* Top dog & Contest controls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {stats?.topDog && (
          <div className="bg-card rounded-2xl shadow-soft p-5">
            <h3 className="font-bold text-foreground flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5 text-primary" /> Najviac hlasovaný pes
            </h3>
            <div className="flex items-center gap-4">
              <img src={stats.topDog.image_url} alt={stats.topDog.name} className="w-16 h-16 rounded-xl object-cover" />
              <div>
                <p className="font-bold text-foreground text-lg">{stats.topDog.name}</p>
                <p className="text-sm text-muted-foreground">{stats.topDog.votes} hlasov</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-card rounded-2xl shadow-soft p-5">
          <h3 className="font-bold text-foreground flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-primary" /> Správa súťaže
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">Súťaž aktívna</span>
              <button onClick={toggleContest}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                  stats?.contestActive ? "bg-green-600 text-white" : "bg-secondary text-muted-foreground"
                }`}>
                <Power className="w-3.5 h-3.5" />
                {stats?.contestActive ? "Zapnutá" : "Vypnutá"}
              </button>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-foreground">Dátum ukončenia</span>
              <input
                type="date"
                defaultValue={stats?.contestEndDate ? new Date(stats.contestEndDate).toISOString().slice(0, 10) : ""}
                onChange={(e) => updateEndDate(e.target.value ? new Date(e.target.value).toISOString() : "")}
                className="px-3 py-1.5 rounded-lg bg-input text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <button onClick={resetVotes}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors">
              <RotateCcw className="w-3.5 h-3.5" /> Resetovať všetky hlasy
            </button>
          </div>
        </div>
      </div>

      {/* Notifications removed — available via header bell icon */}

      {/* Recent registrations */}
      <div className="bg-card rounded-2xl shadow-soft">
        <div className="p-5 border-b border-border">
          <h3 className="font-bold text-foreground">Posledné registrácie</h3>
        </div>
        <div className="divide-y divide-border">
          {stats?.recentUsers.map((user: any) => (
            <div key={user.user_id} className="px-5 py-3 flex items-center justify-between hover:bg-secondary/30 transition-colors">
              <p className="font-medium text-sm text-foreground">{user.display_name || "Bez mena"}</p>
              <span className="text-xs text-muted-foreground">{new Date(user.created_at).toLocaleDateString("sk")}</span>
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
