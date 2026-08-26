import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const REWARD_CENTS = 60;

const slugCode = (name: string) => {
  const base = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z]/g, "")
    .toUpperCase()
    .slice(0, 8);
  const num = Math.floor(10 + Math.random() * 89);
  return `${base || "PARTNER"}${num}`;
};

const AdminAffiliates = () => {
  const qc = useQueryClient();
  const [name, setName] = useState("");

  const { data: affiliates = [] } = useQuery({
    queryKey: ["admin-affiliates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("affiliates")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: dogs = [] } = useQuery({
    queryKey: ["admin-affiliate-dogs"],
    queryFn: async () => {
      const { data } = await supabase.from("dogs").select("ref_code").not("ref_code", "is", null);
      return data || [];
    },
  });

  const regsFor = (code: string) => dogs.filter((d: any) => d.ref_code === code).length;

  const add = useMutation({
    mutationFn: async () => {
      if (!name.trim()) throw new Error("Zadajte meno partnera");
      const { error } = await supabase
        .from("affiliates")
        .insert({ name: name.trim(), code: slugCode(name), reward_cents: REWARD_CENTS });
      if (error) throw error;
    },
    onSuccess: () => {
      setName("");
      toast.success("Partner pridaný");
      qc.invalidateQueries({ queryKey: ["admin-affiliates"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const togglePaid = useMutation({
    mutationFn: async (row: any) => {
      const { error } = await supabase
        .from("affiliates")
        .update({ paid: !row.paid, paid_at: !row.paid ? new Date().toISOString() : null })
        .eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-affiliates"] }),
    onError: (e: any) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("affiliates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Partner odstránený");
      qc.invalidateQueries({ queryKey: ["admin-affiliates"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  const copyLink = async (code: string) => {
    try {
      await navigator.clipboard.writeText(`https://najkrajsipes.eu?ref=${code}`);
      toast.success("Odkaz skopírovaný");
    } catch {
      toast.error("Kopírovanie sa nepodarilo");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-1">Affiliate partneri / Influenceri</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Odmena je <strong>0,60 €</strong> za každú registráciu psa cez partnerský odkaz.
      </p>

      <div className="bg-card rounded-2xl p-5 shadow-soft mb-6 flex flex-col sm:flex-row gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Meno partnera (napr. Zuzka)"
          className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-foreground"
        />
        <button
          onClick={() => add.mutate()}
          disabled={add.isPending}
          className="gradient-golden text-primary-foreground px-5 py-2.5 rounded-xl font-semibold inline-flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Pridať partnera
        </button>
      </div>

      <div className="bg-card rounded-2xl shadow-soft overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="p-3">Meno</th>
              <th className="p-3">Kód</th>
              <th className="p-3">Kliky</th>
              <th className="p-3">Registrácie</th>
              <th className="p-3">Zárobok</th>
              <th className="p-3">Výplata</th>
              <th className="p-3">Akcie</th>
            </tr>
          </thead>
          <tbody>
            {affiliates.length === 0 && (
              <tr><td colSpan={7} className="p-4 text-muted-foreground">Zatiaľ žiadni partneri.</td></tr>
            )}
            {affiliates.map((a: any) => {
              const regs = regsFor(a.code);
              const earn = (regs * (a.reward_cents ?? REWARD_CENTS)) / 100;
              return (
                <tr key={a.id} className="border-b border-border/60">
                  <td className="p-3 font-medium text-foreground">{a.name}</td>
                  <td className="p-3 font-mono">{a.code}</td>
                  <td className="p-3">{a.clicks ?? 0}</td>
                  <td className="p-3">{regs}</td>
                  <td className="p-3">{earn.toFixed(2).replace(".", ",")} €</td>
                  <td className="p-3">
                    <button
                      onClick={() => togglePaid.mutate(a)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${a.paid ? "bg-green-100 text-green-800" : "bg-secondary text-secondary-foreground"}`}
                    >
                      {a.paid ? "vyplatené" : "nevyplatené"}
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => copyLink(a.code)} title="Kopírovať odkaz" className="p-2 rounded-lg hover:bg-secondary">
                        <Copy className="w-4 h-4" />
                      </button>
                      <a href={`/ref/${a.code}`} target="_blank" rel="noopener noreferrer" className="text-primary text-xs hover:underline">
                        štatistiky
                      </a>
                      <button onClick={() => remove.mutate(a.id)} title="Vymazať" className="p-2 rounded-lg hover:bg-destructive/10 text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminAffiliates;
