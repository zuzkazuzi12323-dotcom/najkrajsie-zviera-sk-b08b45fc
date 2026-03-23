import { useState } from "react";
import { ShoppingBag, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

type Category = "all" | "dog" | "cat";

const EShop = () => {
  const [category, setCategory] = useState<Category>("all");
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const { user } = useAuth();

  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .order("category")
        .order("name");
      return data || [];
    },
  });

  const filtered = category === "all" ? products : products.filter((p) => p.category === category);
  // Show in-stock first, then out-of-stock
  const sorted = [...filtered].sort((a, b) => (b.in_stock ? 1 : 0) - (a.in_stock ? 1 : 0));

  const handleBuy = async (product: (typeof products)[0]) => {
    if (!product.in_stock) {
      toast.error("Tento produkt momentálne nie je skladom a nie je možné ho objednať.");
      return;
    }
    if (!user) {
      toast.error("Pre nákup sa musíte prihlásiť.");
      return;
    }
    setLoadingId(product.id);
    try {
      const { data, error } = await supabase.functions.invoke("create-product-checkout", {
        body: { productId: product.id, productName: product.name, amount: product.price },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.assign(data.url);
      } else {
        throw new Error("Nepodarilo sa vytvoriť platbu");
      }
    } catch (e: any) {
      toast.error(e.message || "Chyba pri platbe");
    } finally {
      setLoadingId(null);
    }
  };

  const categories: { key: Category; label: string }[] = [
    { key: "all", label: "Všetko" },
    { key: "dog", label: "Psíky 🐶" },
    { key: "cat", label: "Mačky 🐱" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <section className="gradient-golden py-12 text-center">
        <div className="container mx-auto px-4">
          <ShoppingBag className="w-12 h-12 text-primary-foreground mx-auto mb-4" />
          <h1 className="text-3xl md:text-5xl font-extrabold text-primary-foreground mb-3">
            E-shop pre milovníkov zvierat
          </h1>
          <p className="text-primary-foreground/80 max-w-xl mx-auto text-pretty">
            Nákupom produktov v našom e-shope podporujete aj útulky pre zvieratá. Časť výťažku z každého nákupu bude venovaná na pomoc opusteným zvieratám.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8">
        <div className="flex justify-center gap-2 mb-8">
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setCategory(c.key)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                category === c.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {sorted.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">Zatiaľ žiadne produkty v tejto kategórii.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sorted.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-card rounded-2xl shadow-soft overflow-hidden flex flex-col ${
                  !product.in_stock ? "opacity-70" : ""
                }`}
              >
                <Link to={`/eshop/${product.id}`} className="block">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-48 object-cover" />
                  ) : (
                    <div className="w-full h-48 bg-secondary flex items-center justify-center text-4xl">
                      {product.category === "cat" ? "🐱" : "🐶"}
                    </div>
                  )}
                </Link>
                <div className="p-5 flex flex-col flex-1">
                  <span className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    {product.category === "cat" ? "🐱 Mačky" : "🐶 Psíky"}
                  </span>
                  <Link to={`/eshop/${product.id}`}>
                    <h3 className="font-bold text-foreground text-lg mb-1 hover:text-primary transition-colors">{product.name}</h3>
                  </Link>
                  {product.description && (
                    <p className="text-sm text-muted-foreground mb-4 flex-1 line-clamp-2">{product.description}</p>
                  )}
                  {!product.in_stock && (
                    <div className="flex items-center gap-1.5 text-destructive text-xs font-medium mb-3">
                      <AlertTriangle className="w-3.5 h-3.5" /> Nie je skladom
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-xl font-bold text-foreground">
                      {(product.price / 100).toFixed(2)} €
                    </span>
                    <button
                      onClick={() => handleBuy(product)}
                      disabled={loadingId === product.id || !product.in_stock}
                      className="gradient-golden text-primary-foreground px-5 py-2.5 rounded-full font-semibold text-sm shadow-golden hover:scale-105 transition-transform disabled:opacity-50"
                    >
                      {!product.in_stock ? "Vypredané" : loadingId === product.id ? "..." : "Kúpiť"}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default EShop;
