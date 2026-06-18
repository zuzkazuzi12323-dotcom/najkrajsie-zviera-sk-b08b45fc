import { useState, useEffect } from "react";
import { Link, useLocation, Outlet, Navigate } from "react-router-dom";
import { 
  LayoutDashboard, Users, Dog, MessageCircle, CreditCard, 
  LogOut, Heart, ChevronLeft, Menu, ShoppingBag, Bell, FileText, Handshake, HousePlus
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const navItems = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/admin/pouzivatelia", icon: Users, label: "Používatelia" },
  { to: "/admin/psy", icon: Dog, label: "Správa psov" },
  { to: "/admin/komentare", icon: MessageCircle, label: "Komentáre" },
  { to: "/admin/platby", icon: CreditCard, label: "Platby" },
  { to: "/admin/produkty", icon: ShoppingBag, label: "E-shop produkty" },
  { to: "/admin/partneri", icon: Handshake, label: "Partneri a bannery" },
  { to: "/admin/obsah", icon: FileText, label: "Obsah stránok" },
];

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const location = useLocation();
  const { user, isAdmin, loading } = useAuth();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ["admin-header-notifications"],
    queryFn: async () => {
      const { data } = await supabase
        .from("admin_notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(8);
      return data || [];
    },
  });

  const unreadCount = notifications.filter((n: any) => !n.read).length;

  const markAllRead = async () => {
    const unread = notifications.filter((n: any) => !n.read).map((n: any) => n.id);
    if (unread.length === 0) return;
    await supabase.from("admin_notifications").update({ read: true }).in("id", unread);
    queryClient.invalidateQueries({ queryKey: ["admin-header-notifications"] });
    queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
  };

  useEffect(() => {
    const channel = supabase
      .channel("admin-header-notifs")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "admin_notifications" }, () => {
        queryClient.invalidateQueries({ queryKey: ["admin-header-notifications"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Načítavam...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-card border-r border-border transition-all duration-300 flex flex-col ${
          collapsed ? "w-16" : "w-64"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          {!collapsed && (
            <Link to="/" className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-primary fill-primary" />
              <span className="font-bold text-foreground text-sm">Admin Panel</span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1.5 rounded-lg hover:bg-secondary text-muted-foreground"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-2 border-t border-border">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Späť na web</span>}
          </Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-foreground/20 z-30 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Notification dropdown overlay */}
      {notifOpen && <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />}

      {/* Content */}
      <main className={`flex-1 transition-all duration-300 ${collapsed ? "md:ml-16" : "md:ml-64"}`}>
        <header className="h-16 border-b border-border flex items-center justify-between px-4 md:px-6 bg-card sticky top-0 z-20">
          <div className="flex items-center">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-secondary mr-2"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="font-semibold text-foreground">
              {navItems.find((n) => n.to === location.pathname)?.label || "Admin"}
            </h2>
          </div>

          {/* Notification bell - top right */}
          <div className="relative">
            <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
              <Bell className="w-5 h-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-card rounded-xl shadow-elevated border border-border z-50 overflow-hidden">
                <div className="p-3 border-b border-border flex items-center justify-between">
                  <span className="font-semibold text-sm text-foreground">Notifikácie</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-primary hover:underline">Označiť prečítané</button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-border">
                  {notifications.map((n: any) => (
                    <div key={n.id} className={`px-3 py-2.5 ${!n.read ? "bg-primary/5" : ""}`}>
                      <p className="text-sm text-foreground">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(n.created_at).toLocaleDateString("sk")} {new Date(n.created_at).toLocaleTimeString("sk", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  ))}
                  {notifications.length === 0 && <p className="px-3 py-6 text-center text-muted-foreground text-sm">Žiadne notifikácie</p>}
                </div>
              </div>
            )}
          </div>
        </header>
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
