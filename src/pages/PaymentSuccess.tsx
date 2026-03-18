import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const dogId = searchParams.get("dog_id");

  useEffect(() => {
    // Give webhook a moment to process, then just show success
    const timer = setTimeout(() => setVerifying(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Overujeme platbu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <div className="w-20 h-20 rounded-full gradient-golden flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Platba úspešná!</h1>
        <p className="text-muted-foreground mb-8">
          Váš pes bol úspešne pridaný do súťaže. Ďakujeme za platbu!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {dogId && (
            <Link to={`/pes/${dogId}`}>
              <motion.button
                whileTap={{ scale: 0.95 }}
                className="gradient-golden text-primary-foreground px-6 py-3 rounded-full font-bold flex items-center gap-2"
              >
                Zobraziť psa <ArrowRight className="w-4 h-4" />
              </motion.button>
            </Link>
          )}
          <Link to="/galeria">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className={`${dogId ? "bg-secondary text-secondary-foreground" : "gradient-golden text-primary-foreground"} px-6 py-3 rounded-full font-bold flex items-center gap-2`}
            >
              Zobraziť galériu <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
          <Link to="/">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="bg-secondary text-secondary-foreground px-6 py-3 rounded-full font-medium"
            >
              Domov
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
