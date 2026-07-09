import { useState, useEffect } from "react";
import { X, Info, AlertTriangle, CheckCircle2, BadgeCheck } from "lucide-react";
import { useActiveAnnouncements } from "@/hooks/useAnnouncements";

const VARIANTS: Record<string, { icon: typeof Info; className: string }> = {
  info: { icon: Info, className: "bg-primary/10 text-foreground border-primary/30" },
  warning: { icon: AlertTriangle, className: "bg-amber-100 text-amber-900 border-amber-300" },
  success: { icon: CheckCircle2, className: "bg-green-100 text-green-900 border-green-300" },
};

const AnnouncementBanner = () => {
  const { data: announcements = [] } = useActiveAnnouncements();
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    try {
      setDismissed(JSON.parse(localStorage.getItem("dismissed-announcements") || "[]"));
    } catch {
      /* ignore */
    }
  }, []);

  const dismiss = (id: string) => {
    const next = [...dismissed, id];
    setDismissed(next);
    localStorage.setItem("dismissed-announcements", JSON.stringify(next));
  };

  const visible = announcements.filter((a) => !dismissed.includes(a.id));
  if (visible.length === 0) return null;

  return (
    <div className="space-y-2 px-4 pt-3">
      {visible.map((a) => {
        const v = VARIANTS[a.variant] || VARIANTS.info;
        const Icon = v.icon;
        return (
          <div
            key={a.id}
            className={`max-w-4xl mx-auto flex items-start gap-3 rounded-xl border px-4 py-3 ${v.className}`}
          >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 font-bold text-sm text-primary">
                  NajkrajšíPes
                  <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500/15" aria-label="Overené oficiálne oznámenie" />
                </span>
                <span className="text-xs text-muted-foreground">· oficiálne oznámenie</span>
              </div>
              <p className="font-semibold text-sm mt-0.5">{a.title}</p>
              <p className="text-sm whitespace-pre-line break-words">{a.message}</p>
            </div>
            <button
              onClick={() => dismiss(a.id)}
              aria-label="Zavrieť oznámenie"
              className="p-1 rounded-lg hover:bg-black/5 flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default AnnouncementBanner;
