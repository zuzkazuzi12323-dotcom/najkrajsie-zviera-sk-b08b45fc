import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// Module-level guard so welcome email is only attempted once per browser session per user
const welcomeAttempted = new Set<string>();

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  profile: { display_name: string | null; avatar_url: string | null; blocked: boolean } | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,
  profile: null,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState<AuthContextType["profile"]>(null);

  const checkAdmin = async (userId: string) => {
    const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    setIsAdmin(!!data);
  };

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("display_name, avatar_url, blocked")
      .eq("user_id", userId)
      .single();
    setProfile(data);
  };

  // Send welcome email once after user has a confirmed email (first sign-in after verification)
  const maybeSendWelcomeEmail = async (u: User) => {
    if (!u.email_confirmed_at || !u.email) return;
    if (welcomeAttempted.has(u.id)) return;
    welcomeAttempted.add(u.id);

    // Atomic conditional update: only the first concurrent caller flips false -> true
    const { data: updated, error: updateErr } = await supabase
      .from("profiles")
      .update({ welcome_email_sent: true } as any)
      .eq("user_id", u.id)
      .eq("welcome_email_sent", false)
      .select("user_id, display_name");

    if (updateErr || !updated || updated.length === 0) return; // already sent or no profile yet

    const displayName = (updated[0] as any).display_name || u.email.split("@")[0];
    supabase.functions.invoke("send-welcome-email", {
      body: { email: u.email, displayName },
    }).catch((err) => console.error("welcome email failed", err));
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => {
          checkAdmin(session.user.id);
          fetchProfile(session.user.id);
          maybeSendWelcomeEmail(session.user);
        }, 0);
      } else {
        setIsAdmin(false);
        setProfile(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdmin(session.user.id);
        fetchProfile(session.user.id);
        maybeSendWelcomeEmail(session.user);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, profile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
