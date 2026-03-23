import { useState, useEffect } from "react";
import { Cookie } from "lucide-react";

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4">
      <div className="container mx-auto max-w-2xl bg-card rounded-2xl shadow-elevated border border-border p-5">
        <div className="flex items-start gap-3">
          <Cookie className="w-6 h-6 text-primary mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-foreground mb-1 font-medium">Používame cookies</p>
            <p className="text-xs text-muted-foreground mb-3">
              Naša stránka používa nevyhnutné cookies pre správne fungovanie a analytické cookies pre zlepšenie služieb.{" "}
              <a href="/ochrana-udajov" className="text-primary hover:underline">Viac info</a>
            </p>
            <div className="flex gap-2">
              <button onClick={accept} className="gradient-golden text-primary-foreground px-4 py-2 rounded-full text-xs font-semibold">
                Súhlasím
              </button>
              <button onClick={decline} className="bg-secondary text-secondary-foreground px-4 py-2 rounded-full text-xs font-semibold hover:bg-secondary/80 transition-colors">
                Len nevyhnutné
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
