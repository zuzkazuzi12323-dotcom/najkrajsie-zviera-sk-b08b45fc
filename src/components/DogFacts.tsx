import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PawPrint } from "lucide-react";
import { PAID_PRICE_LABEL, REGISTRATION_FREE } from "@/lib/pricing";

const FACTS = [
  { emoji: "🐶", title: "Psy rozumejú až 250 slovám!", desc: "Sú múdrejší ako si myslíme", accent: "#FFC107" },
  { emoji: "❤️", title: "Váš pes vás miluje ako dieťa", desc: "Pri pohľade na vás sa mu tvorí hormón lásky", accent: "#FF9800" },
  { emoji: "👃", title: "Nos psa je 40× silnejší", desc: "Preto vás vždy nájde", accent: "#2196F3" },
  { emoji: "🐾", title: "Každý psí nos je jedinečný", desc: "Ako odtlačok prsta", accent: "#FFC107" },
  { emoji: "😴", title: "Psy snívajú ako my", desc: "Preto štekajú v spánku", accent: "#FF9800" },
  { emoji: "🏆", title: "Najrýchlejší pes beží 72 km/h", desc: "To je Greyhound!", accent: "#2196F3" },
];

const DogFacts = () => {
  const [index, setIndex] = useState(0);
  const touchStart = useRef<number | null>(null);
  const priceLabel = REGISTRATION_FREE ? "ZADARMO" : PAID_PRICE_LABEL;

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % FACTS.length), 3000);
    return () => clearInterval(id);
  }, []);

  const flakes = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        char: i % 2 === 0 ? "🐾" : "🦴",
        left: `${(i * 8.3 + 3) % 97}%`,
        duration: `${9 + (i % 5) * 2.5}s`,
        delay: `${(i % 6) * 1.7}s`,
        size: `${14 + (i % 4) * 6}px`,
      })),
    []
  );

  return (
    <section className="container mx-auto px-4 pb-12">
      <style>{`
        @keyframes dfGradient { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes dfFall { 0%{transform:translateY(-15%) rotate(0deg);opacity:0} 10%{opacity:.3} 90%{opacity:.3} 100%{transform:translateY(115%) rotate(220deg);opacity:0} }
        @keyframes dfFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes dfBounce { 0%{transform:scale(.92) translateY(10px);opacity:0} 60%{transform:scale(1.03) translateY(-3px);opacity:1} 100%{transform:scale(1) translateY(0);opacity:1} }
        .df-wrap{background:linear-gradient(90deg,#FFEB3B,#FF9800,#FFCCBC,#FF9800,#FFEB3B);background-size:300% 100%;animation:dfGradient 10s linear infinite}
        .df-flake{position:absolute;top:-10%;opacity:.3;animation-name:dfFall;animation-timing-function:linear;animation-iteration-count:infinite;will-change:transform}
        .df-icon{animation:dfFloat 3s ease-in-out infinite}
        .df-card{animation:dfBounce .5s ease-out both}
        @media (prefers-reduced-motion: reduce){.df-wrap,.df-flake,.df-icon,.df-card{animation:none!important}}
      `}</style>

      <div className="df-wrap relative overflow-hidden rounded-3xl p-6 md:p-10 shadow-elevated">
        <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
          {flakes.map((f, i) => (
            <span
              key={i}
              className="df-flake"
              style={{ left: f.left, fontSize: f.size, animationDuration: f.duration, animationDelay: f.delay }}
            >
              {f.char}
            </span>
          ))}
        </div>

        <div className="relative">
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground text-center mb-6 drop-shadow-sm">
            🐾 Vedeli ste že...?
          </h2>

          <div
            className="max-w-md mx-auto touch-pan-y"
            onTouchStart={(e) => (touchStart.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchStart.current === null) return;
              const dx = e.changedTouches[0].clientX - touchStart.current;
              if (Math.abs(dx) > 40)
                setIndex((i) => (dx < 0 ? (i + 1) % FACTS.length : (i - 1 + FACTS.length) % FACTS.length));
              touchStart.current = null;
            }}
          >
            <div
              key={index}
              className="df-card bg-card rounded-[20px] shadow-elevated p-6 text-center border-4"
              style={{ borderColor: FACTS[index].accent }}
            >
              <div className="df-icon text-5xl mb-3">{FACTS[index].emoji}</div>
              <h3 className="text-lg md:text-xl font-bold text-card-foreground">{FACTS[index].title}</h3>
              <p className="text-sm text-muted-foreground mt-1">{FACTS[index].desc}</p>
            </div>

            <div className="flex justify-center gap-2 mt-4">
              {FACTS.map((f, i) => (
                <button
                  key={f.title}
                  aria-label={`Zaujímavosť ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`h-2.5 rounded-full transition-all ${i === index ? "w-6 bg-foreground" : "w-2.5 bg-foreground/40"}`}
                />
              ))}
            </div>
          </div>

          <div className="text-center mt-7">
            <p className="font-bold text-foreground text-pretty">Každý pes je originál. Ukáž nám toho svojho! 👇</p>
            <Link
              to="/pridat"
              className="mt-3 inline-flex items-center gap-2 bg-card text-card-foreground px-5 py-2.5 rounded-full font-bold shadow-soft text-sm active:scale-95 transition-transform"
            >
              <PawPrint className="w-4 h-4" /> Pridať psa ({priceLabel})
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DogFacts;
