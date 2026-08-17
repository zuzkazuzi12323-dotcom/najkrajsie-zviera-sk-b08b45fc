import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Clock, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ContestCountdown = () => {
  const { data: contest } = useQuery({
    queryKey: ["contest-settings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("contest_settings")
        .select("active, end_date")
        .eq("id", "00000000-0000-0000-0000-000000000002")
        .single();
      return data;
    },
  });

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    if (!contest?.end_date) return;
    const update = () => {
      const now = new Date().getTime();
      const end = new Date(contest.end_date!).getTime();
      const diff = end - now;
      if (diff <= 0) {
        setEnded(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setEnded(false);
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [contest?.end_date]);

  if (!contest?.end_date && contest?.active !== false) return null;

  const isInactive = !contest?.active || ended;

  if (isInactive) {
    return (
      <section className="container mx-auto px-4 mt-6">
        <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-4 md:p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            <p className="text-lg md:text-xl font-bold text-destructive">Súťaž bola ukončená</p>
          </div>
          <p className="text-sm text-muted-foreground">Hlasovanie je momentálne pozastavené. Ďakujeme za účasť!</p>
        </div>
      </section>
    );
  }

  const endDate = new Date(contest.end_date!).toLocaleDateString("sk", { day: "numeric", month: "numeric", year: "numeric" });

  return (
    <section className="container mx-auto px-4 mt-6">
      <div className="bg-foreground rounded-3xl p-5 md:p-7 shadow-elevated max-w-2xl mx-auto border border-primary/40">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-primary animate-soft-bounce" />
          <p className="text-sm md:text-base font-bold text-background">
            Súťaž končí: <span className="text-primary">{endDate}</span>
          </p>
        </div>
        <div className="flex items-start justify-center gap-2 md:gap-4">
          {[
            { val: timeLeft.days, label: "dní" },
            { val: timeLeft.hours, label: "hod" },
            { val: timeLeft.minutes, label: "min" },
            { val: timeLeft.seconds, label: "sek" },
          ].map((t) => (
            <div key={t.label} className="text-center">
              <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-primary/15 border border-primary/40 flex items-center justify-center overflow-hidden">
                <span
                  key={t.val}
                  className="text-2xl md:text-4xl font-extrabold tabular-nums text-primary animate-flip-in"
                >
                  {String(t.val).padStart(2, "0")}
                </span>
              </div>
              <span className="mt-1 block text-[10px] md:text-xs font-semibold uppercase tracking-wider text-background/70">{t.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContestCountdown;
