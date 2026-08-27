import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    let done = false;

    const finish = (target: string) => {
      if (done) return;
      done = true;
      navigate(target, { replace: true });
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) {
        toast.success("Úspešne prihlásený!");
        finish("/");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        toast.success("Úspešne prihlásený!");
        finish("/");
      } else {
        setTimeout(() => {
          supabase.auth.getSession().then(({ data: { session: s } }) => {
            if (s) finish("/");
            else {
              toast.error("Prihlásenie sa nepodarilo. Skúste to znova.");
              finish("/prihlasenie");
            }
          });
        }, 2500);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Prihlasujeme vás…</p>
      </div>
    </div>
  );
};

export default AuthCallback;
