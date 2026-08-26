import { useState, useEffect } from "react";
import { Cookie } from "lucide-react";

const CONSENT_KEY = "cookie-consent";

/** Vypne/zapne analytické skripty podľa súhlasu používateľa. */
export const applyAnalyticsConsent = (accepted: boolean) => {
  (window as any).__analyticsEnabled = accepted;
  if (!accepted) {
    // Zakážeme prípadné analytické nástroje a vyčistíme ich cookies.
    (window as any)["ga-disable-analytics"] = true;
    document.cookie.split(";").forEach((c) => {
      const name = c.split("=")[0].trim();
      if (/^_ga|^_gid|^_fbp|^_hj/.test(name)) {
        document.cookie = `${name}=; Max-Age=0; path=/`;
      }
    });
  }
};

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) setVisible(true);
    else applyAnalyticsConsent(consent === "accepted");
  }, []);

  const decide = (accepted: boolean) => {
    localStorage.setItem(CONSENT_KEY, accepted ? "accepted" : "declined");
    applyAnalyticsConsent(accepted);
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
              Nevyhnutné cookies potrebujeme pre prihlásenie a hlasovanie. Analytické cookies použijeme len s vaším súhlasom –
              ak zvolíte „Len nevyhnutné“, analytika sa nespustí.{" "}
              <a href="/ochrana-udajov" className="text-primary hover:underline">Viac info</a>
            </p>
            <div className="flex gap-2">
              <button onClick={() => decide(true)} className="gradient-golden text-primary-foreground px-4 py-2 rounded-full text-xs font-semibold">
                Súhlasím
              </button>
              <button onClick={() => decide(false)} className="bg-secondary text-secondary-foreground px-4 py-2 rounded-full text-xs font-semibold hover:bg-secondary/80 transition-colors">
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
