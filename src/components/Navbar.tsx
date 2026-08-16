import { Link, useLocation } from "react-router-dom";
import { Heart, Menu, X, User, LogIn, LogOut, Shield, ChevronDown, Bell, BadgeCheck, Receipt } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useActiveAnnouncements } from "@/hooks/useAnnouncements";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<string[]>([]);
  const location = useLocation();
  const { user, isAdmin, profile, signOut } = useAuth();
  const { data: announcements = [] } = useActiveAnnouncements();

  useEffect(() => {
    try {
      setDismissedAnnouncements(JSON.parse(localStorage.getItem("dismissed-announcements") || "[]"));
    } catch {
      setDismissedAnnouncements([]);
    }
  }, []);

  const visibleAnnouncements = user ? announcements.filter((a) => !dismissedAnnouncements.includes(a.id)) : [];

  const dismissAnnouncement = (id: string) => {
    const next = [...new Set([...dismissedAnnouncements, id])];
    setDismissedAnnouncements(next);
    localStorage.setItem("dismissed-announcements", JSON.stringify(next));
  };

  const markAllAnnouncementsRead = () => {
    const next = [...new Set([...dismissedAnnouncements, ...announcements.map((a) => a.id)])];
    setDismissedAnnouncements(next);
    localStorage.setItem("dismissed-announcements", JSON.stringify(next));
  };

  const mainLinks = [
    { to: "/", label: "Domov" },
    { to: "/galeria", label: "Súťaž" },
    { to: "/pridat", label: "Pridať psa" },
    { to: "/rebricek", label: "Hlasovanie 🏆" },
    { to: "/podpora", label: "Podporovatelia" },
    { to: "/transparentnost", label: "Transparentnosť 🔍" },
    { to: "/vitazi", label: "Víťazi" },
    { to: "/archiv", label: "Archív 📦" },
  ];

  const moreLinks = [
    { to: "/utulky", label: "Podpora útulkov ❤️" },
    { to: "/historia-utulkov", label: "História útulkov 🐾" },
    { to: "/spolupraca-utulky", label: "Spolupráca s útulkami 🏠" },
    { to: "/ako-funguje", label: "Ako to funguje" },
    { to: "/#o-projekte", label: "O projekte" },
    { to: "/partneri", label: "Partneri" },
    { to: "/kontakt", label: "Kontakt" },
    { to: "/pravidla", label: "Pravidlá súťaže" },
    { to: "/ochrana-udajov", label: "Ochrana údajov" },
  ];

  const allLinks = [...mainLinks, ...moreLinks];
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Heart className="w-7 h-7 text-primary fill-primary group-hover:scale-110 transition-transform" />
          <span className="text-xl font-bold tracking-tight text-foreground">
            NajkrajšíPes<span className="text-primary">.eu</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {mainLinks.map((link) => (
            <Link key={link.to} to={link.to}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isActive(link.to) ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}>{link.label}</Link>
          ))}
          <div className="relative">
            <button onClick={() => setMoreOpen(!moreOpen)}
              className="px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex items-center gap-1">
              Viac <ChevronDown className="w-3.5 h-3.5" />
            </button>
            <AnimatePresence>
              {moreOpen && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                  className="absolute top-full right-0 mt-1 w-52 bg-card rounded-xl shadow-elevated border border-border overflow-hidden z-50">
                  {moreLinks.map((link) => (
                    <Link key={link.to} to={link.to} onClick={() => setMoreOpen(false)}
                      className={`block px-4 py-3 text-sm transition-colors ${
                        isActive(link.to) ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                      }`}>{link.label}</Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <div className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  aria-label="Upozornenia"
                >
                  <Bell className="w-5 h-5" />
                  {visibleAnnouncements.length > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                      {visibleAnnouncements.length}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-card rounded-xl shadow-elevated border border-border overflow-hidden z-50">
                    <div className="p-3 border-b border-border flex items-center justify-between gap-3">
                      <span className="font-semibold text-sm text-foreground">Upozornenia</span>
                      {visibleAnnouncements.length > 0 && (
                        <button onClick={markAllAnnouncementsRead} className="text-xs text-primary hover:underline whitespace-nowrap">
                          Všetko prečítané
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-border">
                      {visibleAnnouncements.map((a) => (
                        <div key={a.id} className="px-3 py-3 bg-primary/5">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary mb-1">
                            NajkrajšíPes <BadgeCheck className="w-3.5 h-3.5" />
                          </div>
                          <p className="text-sm font-semibold text-foreground">{a.title}</p>
                          <p className="text-sm text-muted-foreground whitespace-pre-line break-words mt-1">{a.message}</p>
                          <button onClick={() => dismissAnnouncement(a.id)} className="mt-2 text-xs text-primary hover:underline">
                            Označiť ako prečítané
                          </button>
                        </div>
                      ))}
                      {visibleAnnouncements.length === 0 && (
                        <p className="px-3 py-8 text-center text-sm text-muted-foreground">Žiadne nové upozornenia</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              {isAdmin && (
                <Link to="/admin" className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                  <Shield className="w-4 h-4" /> Admin
                </Link>
              )}
              <Link to="/moj-profil" className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                <User className="w-4 h-4" /> Môj profil
              </Link>
              <Link to="/moje-potvrdenia" className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                <Receipt className="w-4 h-4" /> Potvrdenia
              </Link>
              <span className="text-sm text-muted-foreground px-2">{profile?.display_name || user.email}</span>
              <button onClick={signOut} className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                <LogOut className="w-4 h-4" /> Odhlásiť
              </button>
            </>
          ) : (
            <>
              <Link to="/prihlasenie" className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                <LogIn className="w-4 h-4" /> Prihlásiť sa
              </Link>
              <Link to="/registracia" className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium gradient-golden text-primary-foreground shadow-golden transition-transform hover:scale-105">
                <User className="w-4 h-4" /> Registrácia
              </Link>
            </>
          )}
        </div>

        {/* Mobile actions */}
        <div className="md:hidden flex items-center gap-1">
          {user && (
            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                aria-label="Upozornenia"
              >
                <Bell className="w-5 h-5" />
                {visibleAnnouncements.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {visibleAnnouncements.length}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="fixed left-4 right-4 top-16 max-w-sm ml-auto bg-card rounded-xl shadow-elevated border border-border overflow-hidden z-50">
                  <div className="p-3 border-b border-border flex items-center justify-between gap-3">
                    <span className="font-semibold text-sm text-foreground flex items-center gap-2">
                      NajkrajšíPes <BadgeCheck className="w-4 h-4 text-primary" />
                      {visibleAnnouncements.length > 0 && (
                        <span className="min-w-5 h-5 px-1.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                          {visibleAnnouncements.length}
                        </span>
                      )}
                    </span>
                    {visibleAnnouncements.length > 0 && (
                      <button onClick={markAllAnnouncementsRead} className="text-xs text-primary hover:underline whitespace-nowrap">
                        Všetko prečítané
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-border">
                    {visibleAnnouncements.map((a) => (
                      <div key={a.id} className="px-3 py-3 bg-primary/5">
                        <p className="text-sm font-semibold text-foreground">{a.title}</p>
                        <p className="text-sm text-muted-foreground whitespace-pre-line break-words mt-1">{a.message}</p>
                        <button onClick={() => dismissAnnouncement(a.id)} className="mt-2 text-xs text-primary hover:underline">
                          Označiť ako prečítané
                        </button>
                      </div>
                    ))}
                    {visibleAnnouncements.length === 0 && (
                      <p className="px-3 py-8 text-center text-sm text-muted-foreground">Žiadne nové upozornenia</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-secondary transition-colors">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Close more dropdown on outside click */}
      {moreOpen && <div className="fixed inset-0 z-40" onClick={() => setMoreOpen(false)} />}
      {notifOpen && <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />}

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-b border-border bg-background">
            <div className="px-4 py-4 flex flex-col gap-2">
              {user && isAdmin && (
                <Link to="/admin" onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm font-semibold gradient-golden text-primary-foreground flex items-center gap-2 shadow-golden">
                  <Shield className="w-4 h-4" /> Admin Panel
                </Link>
              )}
              {allLinks.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive(link.to) ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
                  }`}>{link.label}</Link>
              ))}
              <div className="h-px bg-border my-2" />
              {user && (
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <div className="px-4 py-3 flex items-center justify-between gap-3 border-b border-border">
                    <span className="text-sm font-semibold text-foreground flex items-center gap-2"><Bell className="w-4 h-4 text-primary" /> Upozornenia</span>
                    {visibleAnnouncements.length > 0 && (
                      <button onClick={markAllAnnouncementsRead} className="text-xs text-primary font-medium">Všetko prečítané</button>
                    )}
                  </div>
                  <div className="divide-y divide-border">
                    {visibleAnnouncements.slice(0, 3).map((a) => (
                      <div key={a.id} className="px-4 py-3 bg-primary/5">
                        <p className="text-sm font-semibold text-foreground">{a.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{a.message}</p>
                        <button onClick={() => dismissAnnouncement(a.id)} className="mt-2 text-xs text-primary font-medium">Prečítané</button>
                      </div>
                    ))}
                    {visibleAnnouncements.length === 0 && <p className="px-4 py-4 text-sm text-muted-foreground">Žiadne nové upozornenia</p>}
                  </div>
                </div>
              )}
              {user ? (
                <>
                  <Link to="/moj-profil" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary flex items-center gap-2">
                    <User className="w-4 h-4" /> Môj profil
                  </Link>
                  <Link to="/moje-potvrdenia" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary flex items-center gap-2">
                    <Receipt className="w-4 h-4" /> Moje potvrdenia
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary flex items-center gap-2">
                      <Shield className="w-4 h-4" /> Admin Panel
                    </Link>
                  )}
                  <button onClick={() => { signOut(); setMobileOpen(false); }} className="px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary text-left">
                    Odhlásiť sa
                  </button>
                </>
              ) : (
                <>
                  <Link to="/prihlasenie" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary">Prihlásiť sa</Link>
                  <Link to="/registracia" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-xl text-sm font-medium gradient-golden text-primary-foreground text-center">Registrácia</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
