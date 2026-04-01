import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ArrowLeft, ChevronLeft, ChevronRight, ShoppingBag, AlertTriangle, Share2, Copy, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [currentImg, setCurrentImg] = useState(0);
  const [loading, setLoading] = useState(false);

  const { data: product } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("id", id!).single();
      return data;
    },
    enabled: !!id,
  });

  const { data: extraImages = [] } = useQuery({
    queryKey: ["product-images", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", id!)
        .order("sort_order");
      return data || [];
    },
    enabled: !!id,
  });

  const { data: alternatives = [] } = useQuery({
    queryKey: ["alternatives", product?.category, id],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("category", product!.category)
        .eq("active", true)
        .eq("in_stock", true)
        .neq("id", id!)
        .limit(3);
      return data || [];
    },
    enabled: !!product && !product.in_stock,
  });

  // Build image gallery: main image + extra images
  const allImages = [
    ...(product?.image_url ? [product.image_url] : []),
    ...extraImages.map((img) => img.image_url),
  ];
  if (allImages.length === 0 && product) {
    allImages.push(""); // placeholder
  }

  const handleBuy = async () => {
    if (!product) return;
    if (!user) { toast.error("Pre nákup sa musíte prihlásiť."); return; }
    if (!product.in_stock) { toast.error("Tento produkt momentálne nie je skladom."); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-product-checkout", {
        body: { productId: product.id, productName: product.name, amount: product.price },
      });
      if (error) throw error;
      if (data?.url) window.location.assign(data.url);
      else throw new Error("Nepodarilo sa vytvoriť platbu");
    } catch (e: any) {
      toast.error(e.message || "Chyba pri platbe");
    } finally {
      setLoading(false);
    }
  };

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-muted-foreground">Načítavam...</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <section className="container mx-auto px-4 py-8">
        <Link to="/eshop" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="w-4 h-4" /> Späť na e-shop
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image gallery */}
          <div className="space-y-3">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-secondary">
              <AnimatePresence mode="wait">
                {allImages[currentImg] ? (
                  <motion.img
                    key={currentImg}
                    src={allImages[currentImg]}
                    alt={product.name}
                    className="w-full h-full object-contain"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">
                    {product.category === "cat" ? "🐱" : "🐶"}
                  </div>
                )}
              </AnimatePresence>
              {allImages.length > 1 && (
                <>
                  <button onClick={() => setCurrentImg((p) => (p - 1 + allImages.length) % allImages.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm rounded-full p-2 hover:bg-background transition-colors">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button onClick={() => setCurrentImg((p) => (p + 1) % allImages.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm rounded-full p-2 hover:bg-background transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {allImages.map((url, i) => (
                  <button key={i} onClick={() => setCurrentImg(i)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-colors ${
                      i === currentImg ? "border-primary" : "border-border"
                    }`}>
                    {url ? (
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-secondary flex items-center justify-center text-lg">
                        {product.category === "cat" ? "🐱" : "🐶"}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
              {product.category === "cat" ? "🐱 Mačky" : "🐶 Psíky"}
            </span>
            <h1 className="text-3xl font-bold text-foreground mb-2">{product.name}</h1>
            {product.description && (
              <p className="text-muted-foreground mb-6 whitespace-pre-line">{product.description}</p>
            )}
            <div className="text-3xl font-bold text-foreground mb-1">
              {(product.price / 100).toFixed(2)} €
            </div>
            <p className="text-xs text-muted-foreground mb-6">
              Z toho {((product.price * 0.2) / 100).toFixed(2)} € poputuje útulkom ❤️
            </p>

            {!product.in_stock ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-destructive/10 text-destructive rounded-xl p-4">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-medium">
                    Tento produkt momentálne nie je skladom a nie je možné ho objednať.
                  </p>
                </div>
                {alternatives.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-3">Mohlo by vás zaujímať:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {alternatives.map((alt) => (
                        <Link key={alt.id} to={`/eshop/${alt.id}`}
                          className="bg-card rounded-xl p-3 border border-border hover:border-primary/30 transition-colors">
                          {alt.image_url ? (
                            <img src={alt.image_url} alt={alt.name} className="w-full h-20 object-cover rounded-lg mb-2" />
                          ) : (
                            <div className="w-full h-20 bg-secondary rounded-lg mb-2 flex items-center justify-center text-2xl">
                              {alt.category === "cat" ? "🐱" : "🐶"}
                            </div>
                          )}
                          <p className="text-sm font-medium text-foreground truncate">{alt.name}</p>
                          <p className="text-sm font-bold text-foreground">{(alt.price / 100).toFixed(2)} €</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={handleBuy} disabled={loading}
                className="gradient-golden text-primary-foreground px-8 py-4 rounded-full font-bold text-lg shadow-golden hover:scale-105 transition-transform disabled:opacity-50 flex items-center gap-2 justify-center">
                <ShoppingBag className="w-5 h-5" />
                {loading ? "Spracovávam..." : "Kúpiť"}
              </button>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default ProductDetail;
