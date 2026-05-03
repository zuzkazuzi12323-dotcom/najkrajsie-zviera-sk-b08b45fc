import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

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
    const { data: prof } = await supabase
      .from("profiles")
      .select("welcome_email_sent, display_name")
      .eq("user_id", u.id)
      .single();
    if (!prof || (prof as any).welcome_email_sent) return;
    // Mark first to prevent duplicate sends across tabs
    const { error: updateErr } = await supabase
      .from("profiles")
      .update({ welcome_email_sent: true } as any)
      .eq("user_id", u.id)
      .eq("welcome_email_sent", false);
    if (updateErr) return;
    supabase.functions.invoke("send-welcome-email", {
      body: { email: u.email, displayName: (prof as any).display_name || u.email.split("@")[0] },
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
