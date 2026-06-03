import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, FileText } from "lucide-react";

type Row = {
  key: string;
  page: string;
  label: string;
  value: string;
  type: string;
  sort_order: number;
};

const PAGE_LABELS: Record<string, string> = {
  home: "Domov",
  privacy: "Ochrana osobných údajov",
  rules: "Pravidlá",
  footer: "Pätička",
  adddog: "Pridať psa",
  login: "Prihlásenie",
  register: "Registrácia",
  donate: "Podpora útulkov",
  contact: "Kontakt",
  howitworks: "Ako to funguje",
  partners: "Partneri",
};

const AdminContent = () => {
  const queryClient = useQueryClient();
  const [activePage, setActivePage] = useState("home");
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const { data: rows = [] } = useQuery({
    queryKey: ["admin-site-content"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_content")
        .select("*")
        .order("page")
        .order("sort_order");
      return (data || []) as Row[];
    },
  });

  useEffect(() => {
    // initialize local edits from server values
    const initial: Record<string, string> = {};
    rows.forEach((r) => {
      if (edits[r.key] === undefined) initial[r.key] = r.value;
    });
    if (Object.keys(initial).length > 0) {
      setEdits((prev) => ({ ...initial, ...prev }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows.length]);

  const pages = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => set.add(r.page));
    return Array.from(set);
  }, [rows]);

  const pageRows = rows.filter((r) => r.page === activePage);

  const dirtyKeys = pageRows.filter((r) => edits[r.key] !== undefined && edits[r.key] !== r.value);

  const saveAll = async () => {
    if (dirtyKeys.length === 0) {
      toast.info("Žiadne zmeny na uloženie");
      return;
    }
    setSaving(true);
    let errors = 0;
    for (const r of dirtyKeys) {
      const { error } = await supabase
        .from("site_content")
        .update({ value: edits[r.key] })
        .eq("key", r.key);
      if (error) errors++;
    }
    setSaving(false);
    if (errors > 0) {
      toast.error(`${errors} zmien sa nepodarilo uložiť`);
    } else {
      toast.success(`Uložené (${dirtyKeys.length} zmien)`);
    }
    queryClient.invalidateQueries({ queryKey: ["admin-site-content"] });
    queryClient.invalidateQueries({ queryKey: ["site-content"] });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Editor obsahu stránok</h1>
          <p className="text-sm text-muted-foreground">Upravte texty, nadpisy a tlačidlá na celom webe bez kódu.</p>
        </div>
        <button
          onClick={saveAll}
          disabled={saving || dirtyKeys.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Ukladám..." : `Uložiť zmeny${dirtyKeys.length > 0 ? ` (${dirtyKeys.length})` : ""}`}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Page tabs */}
        <aside className="md:w-56 shrink-0">
          <div className="bg-card rounded-2xl shadow-soft p-2 flex md:flex-col gap-1 overflow-x-auto">
            {pages.map((p) => {
              const active = p === activePage;
              return (
                <button
                  key={p}
                  onClick={() => setActivePage(p)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  {PAGE_LABELS[p] || p}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Editor */}
        <div className="flex-1 bg-card rounded-2xl shadow-soft p-4 md:p-6 space-y-5">
          {pageRows.length === 0 && (
            <p className="text-muted-foreground text-sm">Pre túto stránku zatiaľ nie sú nadefinované editovateľné texty.</p>
          )}
          {pageRows.map((r) => {
            const value = edits[r.key] ?? r.value;
            const isDirty = value !== r.value;
            const isLong = r.type === "textarea" || r.type === "html" || r.value.length > 80;
            return (
              <div key={r.key} className="border-b border-border pb-4 last:border-b-0 last:pb-0">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-semibold text-foreground">{r.label}</label>
                  {isDirty && (
                    <span className="text-[10px] font-bold text-primary uppercase">Neuložené</span>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground font-mono mb-2">{r.key}</p>
                {isLong ? (
                  <textarea
                    value={value}
                    rows={Math.min(10, Math.max(3, value.split("\n").length + 1))}
                    onChange={(e) => setEdits((prev) => ({ ...prev, [r.key]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-y"
                  />
                ) : (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setEdits((prev) => ({ ...prev, [r.key]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminContent;
