import { Link, useLocation } from "react-router-dom";
import { Heart, Menu, X, User, LogIn, LogOut, Shield, ChevronDown, Settings } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const location = useLocation();
  const { user, isAdmin, profile, signOut } = useAuth();

  const mainLinks = [
    { to: "/", label: "Domov" },
    { to: "/galeria", label: "Súťaž" },
    { to: "/pridat", label: "Pridať psa" },
    { to: "/rebricek", label: "Hlasovanie 🏆" },
    { to: "/podpora", label: "Podpora platformy 🐾" },
    { to: "/transparentnost", label: "Transparentnosť 🔍" },
    { to: "/vitazi", label: "Víťazi" },
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
            NajkrajšíPes<span className="text-primary">.sk</span>
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
              {isAdmin && (
                <Link to="/admin" className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                  <Shield className="w-4 h-4" /> Admin
                </Link>
              )}
              <Link to="/moj-profil" className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                <User className="w-4 h-4" /> Môj profil
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

        {/* Mobile toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Close more dropdown on outside click */}
      {moreOpen && <div className="fixed inset-0 z-40" onClick={() => setMoreOpen(false)} />}

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
              {user ? (
                <>
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
