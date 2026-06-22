import { Link } from "react-router-dom";
import { PawPrint } from "lucide-react";

/**
 * Prekrytie vodoznaku "Edit with Lovable" v pravom dolnom rohu.
 * Po kliknutí presmeruje používateľa na registráciu psa.
 */
const BadgeCover = () => {
  return (
    <Link
      to="/pridat"
      aria-label="Pridať psa do súťaže NajkrajšíPes.sk"
      className="fixed bottom-4 right-4 z-[2147483647] flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-2 text-background shadow-lg transition-transform hover:scale-[1.03] active:scale-95"
    >
      <PawPrint className="h-4 w-4 shrink-0" />
      <span className="text-sm font-semibold leading-none">NajkrajšíPes</span>
    </Link>
  );
};

export default BadgeCover;
