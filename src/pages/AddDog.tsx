import { useState } from "react";
import { Upload, ArrowRight, Check } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { toast } from "sonner";

const steps = ["Základné info", "Fotka", "Platba"];

const AddDog = () => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: "",
    breed: "",
    age: "",
    description: "",
  });
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = () => {
    toast.success("Pes bol úspešne pridaný do súťaže! 🎉");
    setStep(0);
    setForm({ name: "", breed: "", age: "", description: "" });
    setPreview(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-10 max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Pridať psa do súťaže</h1>
        <p className="text-muted-foreground mb-8">Zapojiť sa stojí iba 1 €. Vyplňte formulár a pridajte fotku.</p>

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
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="napr. Luna"
                  className="w-full px-4 py-3 rounded-xl bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  maxLength={50}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Plemeno</label>
                <input
                  type="text"
                  value={form.breed}
                  onChange={(e) => setForm({ ...form, breed: e.target.value })}
                  placeholder="napr. Sibírsky husky"
                  className="w-full px-4 py-3 rounded-xl bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  maxLength={50}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Vek</label>
                <input
                  type="text"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  placeholder="napr. 2 roky"
                  className="w-full px-4 py-3 rounded-xl bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  maxLength={20}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Popis</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Povedzte nám niečo o vašom psovi..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  maxLength={500}
                />
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => form.name && form.breed ? setStep(1) : toast.error("Vyplňte meno a plemeno")}
                className="w-full gradient-golden text-primary-foreground py-3 rounded-xl font-bold flex items-center justify-center gap-2"
              >
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
                <button
                  onClick={() => setStep(0)}
                  className="flex-1 py-3 rounded-xl border border-border font-medium text-muted-foreground hover:bg-secondary transition-colors"
                >
                  Späť
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => preview ? setStep(2) : toast.error("Nahrajte fotku")}
                  className="flex-1 gradient-golden text-primary-foreground py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  Pokračovať <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="text-center space-y-6">
              <div className="gradient-golden w-20 h-20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-3xl font-bold text-primary-foreground">1€</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">Poplatok za registráciu</h3>
                <p className="text-muted-foreground mt-1">Jednorazový poplatok za pridanie psa do súťaže</p>
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
                  <span className="text-foreground">Celkom:</span>
                  <span className="text-primary">1,00 €</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl border border-border font-medium text-muted-foreground hover:bg-secondary transition-colors"
                >
                  Späť
                </button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubmit}
                  className="flex-1 gradient-golden text-primary-foreground py-3 rounded-xl font-bold"
                >
                  Zaplatiť 1 €
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
