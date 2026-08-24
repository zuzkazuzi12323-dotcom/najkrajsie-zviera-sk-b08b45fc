import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { XCircle, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const RegistrationCanceled = () => {
  const [searchParams] = useSearchParams();
  const dogId = searchParams.get("dog_id");
  const [cleaning, setCleaning] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!dogId) { setCleaning(false); return; }
      try {
        await supabase.functions.invoke("cancel-dog-registration", { body: { dogId } });
      } catch {/* ignore */}
      if (!cancelled) setCleaning(false);
    })();
    return () => { cancelled = true; };
  }, [dogId]);

  if (cleaning) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Spracovávame zrušenie...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Pes nebol pridaný</h1>
        <p className="text-muted-foreground mb-2">
          Registrácia bola zrušená a žiadna platba nebola vykonaná. Počas augusta 2026 je registrácia psa <strong>ZADARMO</strong>, od septembra 2026 je <strong>1,99 €</strong>.
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          Bez úhrady poplatku sa pes do súťaže nepridáva. Skúste to znova kedykoľvek.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/pridat">
            <motion.button whileTap={{ scale: 0.95 }} className="gradient-golden text-primary-foreground px-6 py-3 rounded-full font-bold flex items-center gap-2">
              Skúsiť znova <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
          <Link to="/">
            <motion.button whileTap={{ scale: 0.95 }} className="bg-secondary text-secondary-foreground px-6 py-3 rounded-full font-medium">
              Domov
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default RegistrationCanceled;
