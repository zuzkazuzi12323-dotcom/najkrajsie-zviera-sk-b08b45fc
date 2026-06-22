import { PawPrint } from "lucide-react";

/**
 * Prekrytie vodoznaku "Edit with Lovable" v pravom dolnom rohu.
 * Rozmermi sadne presne na pôvodný odznak a po kliknutí presmeruje na registráciu psa.
 */
const BadgeCover = () => {
  return (
    <a
      href="/pridat"
      aria-label="Pridať psa do súťaže NajkrajšíPes.sk"
      className="fixed bottom-3 right-3 z-[2147483647] flex h-10 items-center gap-2 rounded-lg bg-foreground px-4 text-background shadow-lg ring-4 ring-background transition-transform hover:scale-[1.03] active:scale-95"
    >
      <PawPrint className="h-4 w-4 shrink-0" />
      <span className="text-sm font-semibold leading-none whitespace-nowrap">NajkrajšíPes</span>
    </a>
  );
};

export default BadgeCover;
