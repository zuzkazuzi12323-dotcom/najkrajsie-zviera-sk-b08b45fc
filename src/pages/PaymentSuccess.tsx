import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight } from "lucide-react";

const PaymentSuccess = () => {
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
          <Link to="/galeria">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="gradient-golden text-primary-foreground px-6 py-3 rounded-full font-bold flex items-center gap-2"
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
