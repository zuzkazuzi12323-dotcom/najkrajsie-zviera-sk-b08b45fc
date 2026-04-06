import { useState } from "react";
import { Upload, ArrowRight, Check, PawPrint } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const steps = ["Základné info", "Fotka", "Odoslať"];

const AddDog = () => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    breed: "",
    age: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Pre pridanie psa sa musíte prihlásiť");
      navigate("/prihlasenie");
      return;
    }
    if (!imageFile) {
      toast.error("Nahrajte fotku psa");
      return;
    }

    setLoading(true);
    try {
      const fileExt = imageFile.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("dog-images")
        .upload(filePath, imageFile);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("dog-images")
        .getPublicUrl(filePath);

      const { data: dogData, error: insertError } = await supabase
        .from("dogs")
        .insert({
          owner_id: user.id,
          name: form.name,
          breed: form.breed,
          age: form.age,
          description: form.description,
          image_url: urlData.publicUrl,
          approved: true,
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      toast.success("Pes bol úspešne pridaný do súťaže! 🎉");
      navigate(`/pes/${dogData.id}`);
    } catch (error: any) {
      toast.error(error.message || "Niečo sa pokazilo");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground mb-2">Musíte sa prihlásiť</p>
            <p className="text-muted-foreground mb-4">Pre pridanie psa sa najprv prihláste.</p>
            <a href="/prihlasenie" className="text-primary font-medium hover:underline">
              Prihlásiť sa
            </a>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Pridať psa do súťaže</h1>
        <p className="text-muted-foreground mb-8">Registrácia je úplne zadarmo 🐾 Vyplňte formulár a pridajte fotku.</p>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-10">
          {steps.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  i <= step
                    ? "gradient-golden text-primary-foreground"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>
                {s}
              </span>
              {i < steps.length - 1 && <div className="w-8 md:w-16 h-px bg-border" />}
            </div>
          ))}
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card rounded-2xl p-6 md:p-8 shadow-soft"
        >
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Meno psa</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="napr. Luna" className="w-full px-4 py-3 rounded-xl bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" maxLength={50} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Plemeno</label>
                <input type="text" value={form.breed} onChange={(e) => setForm({ ...form, breed: e.target.value })}
                  placeholder="napr. Sibírsky husky" className="w-full px-4 py-3 rounded-xl bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" maxLength={50} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Vek</label>
                <input type="text" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })}
                  placeholder="napr. 2 roky" className="w-full px-4 py-3 rounded-xl bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" maxLength={20} />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Popis</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Povedzte nám niečo o vašom psovi..." rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none" maxLength={500} />
              </div>
              <motion.button whileTap={{ scale: 0.95 }}
                onClick={() => form.name && form.breed ? setStep(1) : toast.error("Vyplňte meno a plemeno")}
                className="w-full gradient-golden text-primary-foreground py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                Pokračovať <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <label className="block cursor-pointer">
                <div className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors ${preview ? "border-primary" : "border-border hover:border-primary/50"}`}>
                  {preview ? (
                    <img src={preview} alt="Preview" className="w-full max-h-80 object-cover rounded-xl" />
                  ) : (
                    <div>
                      <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                      <p className="font-medium text-foreground">Nahrať fotku psa</p>
                      <p className="text-sm text-muted-foreground mt-1">JPG, PNG do 5 MB</p>
                    </div>
                  )}
                </div>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
              <div className="flex gap-3">
                <button onClick={() => setStep(0)}
                  className="flex-1 py-3 rounded-xl border border-border font-medium text-muted-foreground hover:bg-secondary transition-colors">
                  Späť
                </button>
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={() => preview ? setStep(2) : toast.error("Nahrajte fotku")}
                  className="flex-1 gradient-golden text-primary-foreground py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                  Pokračovať <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="text-center space-y-6">
              <div className="gradient-golden w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                <PawPrint className="w-10 h-10 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Všetko je pripravené! 🎉</h3>
                <p className="text-muted-foreground mt-1">Registrácia psa je úplne zadarmo</p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-4 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pes:</span>
                  <span className="font-medium text-foreground">{form.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Plemeno:</span>
                  <span className="font-medium text-foreground">{form.breed}</span>
                </div>
                <div className="h-px bg-border" />
                <div className="flex justify-between font-bold">
                  <span className="text-foreground">Cena:</span>
                  <span className="text-green-500">Zadarmo ✓</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl border border-border font-medium text-muted-foreground hover:bg-secondary transition-colors">
                  Späť
                </button>
                <motion.button whileTap={{ scale: 0.95 }} onClick={handleSubmit} disabled={loading}
                  className="flex-1 gradient-golden text-primary-foreground py-3 rounded-xl font-bold disabled:opacity-50">
                  {loading ? "Pridávam..." : "Pridať psa zadarmo 🐾"}
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default AddDog;
