import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { X, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const REF_STORAGE_KEY = "shelter_ref";

const RefBanner = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      // ulož kód do localStorage
      try {
        localStorage.setItem(REF_STORAGE_KEY, ref);
      } catch {
        /* ignore */
      }
      // zaznamenaj klik v databáze (bez čakania)
      supabase.rpc("track_affiliate_click", { _code: ref }).then(() => {
        /* ignore */
      });

      setCode(ref);

      // odstráň ?ref= z URL, aby banner nezmizol po refreshe / navigácii,
      // ale kód ostane v localStorage
      const next = new URLSearchParams(searchParams);
      next.delete("ref");
      setSearchParams(next, { replace: true });
    } else {
      // ak užívateľ len naviguje, nezobrazuj banner znova
      setCode(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  const [dismissed, setDismissed] = useState(false);
  if (!code || dismissed) return null;

  return (
    <div className="sticky top-0 z-[60] w-full bg-yellow-300 text-black border-b-2 border-yellow-500 shadow-md">
      <div className="max-w-6xl mx-auto flex items-center gap-3 px-4 py-2.5">
        <Gift className="w-5 h-5 flex-shrink-0" />
        <p className="flex-1 text-sm font-semibold break-words">
          Používaš pozývací kód:{" "}
          <span className="font-extrabold tracking-wide">{code}</span> — ďakujeme
          za podporu ❤️
        </p>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Zavrieť"
          className="p-1 rounded-lg hover:bg-black/10 flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default RefBanner;
