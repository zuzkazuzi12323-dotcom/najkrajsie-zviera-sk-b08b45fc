import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, PawPrint, Wallet, Send } from "lucide-react";

const PUBLIC_SITE_URL = "https://najkrajsie-zviera-sk.lovable.app";

type PartnerRow = {
  id: string;
  name: string;
  referral_code: string | null;
  referral_visits: number;
  registrations: number;
  totalReward: number;
  paidOut: number;
  pendingReward: number;
};

const AdminReferrals = () => {
  const queryClient = useQueryClient();
  const [payingId, setPayingId] = useState<string | null>(null);

  const { data: partners = [], isLoading } = useQuery({
    queryKey: ["admin-referrals"],
    queryFn: async (): Promise<PartnerRow[]> => {
      const { data: shelters } = await supabase
        .from("shelters")
        .select("id, name, referral_code, referral_visits")
        .not("referral_code", "is", null)
        .order("name", { ascending: true });
      if (!shelters) return [];

      const { data: refs } = await supabase
        .from("shelter_referrals")
        .select("shelter_id, reward_cents");
      const { data: payouts } = await supabase
        .from("shelter_payouts")
        .select("shelter_id, amount_cents");

      return (shelters as any[]).map((s) => {
        const sRefs = (refs || []).filter((r: any) => r.shelter_id === s.id);
        const sPayouts = (payouts || []).filter((p: any) => p.shelter_id === s.id);
        const totalReward = sRefs.reduce((sum: number, r: any) => sum + (r.reward_cents || 0), 0);
        const paidOut = sPayouts.reduce((sum: number, p: any) => sum + (p.amount_cents || 0), 0);
        return {
          id: s.id,
          name: s.name,
          referral_code: s.referral_code,
          referral_visits: s.referral_visits || 0,
          registrations: sRefs.length,
          totalReward,
          paidOut,
          pendingReward: Math.max(totalReward - paidOut, 0),
        };
      });
    },
  });

  const recordPayout = async (p: PartnerRow) => {
    if (p.pendingReward <= 0) return;
    setPayingId(p.id);
    const { error } = await supabase.from("shelter_payouts").insert({
      shelter_id: p.id,
      amount_cents: p.pendingReward,
      note: "Vyplatenie odmeny za partnerské registrácie",
    });
    setPayingId(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Vyplatenie ${(p.pendingReward / 100).toFixed(2)} € zaznamenané`);
    queryClient.invalidateQueries({ queryKey: ["admin-referrals"] });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Partnerské odkazy útulkov</h1>
        <p className="text-sm text-muted-foreground">
          Prehľad návštev, registrácií a odmien (20 % z platenej registrácie) za jednotlivé útulky.
        </p>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Načítavam…</p>
      ) : partners.length === 0 ? (
        <p className="text-muted-foreground">Zatiaľ nie sú žiadni partneri s odkazom.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="p-3 font-medium">Útulok</th>
                <th className="p-3 font-medium">Odkaz</th>
                <th className="p-3 font-medium text-center"><Eye className="w-4 h-4 inline" /> Návštevy</th>
                <th className="p-3 font-medium text-center"><PawPrint className="w-4 h-4 inline" /> Registrácie</th>
                <th className="p-3 font-medium text-right">Odmena spolu</th>
                <th className="p-3 font-medium text-right">Vyplatené</th>
                <th className="p-3 font-medium text-right">Na vyplatenie</th>
                <th className="p-3 font-medium text-right">Akcia</th>
              </tr>
            </thead>
            <tbody>
              {partners.map((p) => (
                <tr key={p.id} className="border-b border-border/60 last:border-0">
                  <td className="p-3 font-medium text-foreground">{p.name}</td>
                  <td className="p-3 text-muted-foreground">
                    <span className="truncate block max-w-[220px]">{PUBLIC_SITE_URL}/pridat?ref={p.referral_code}</span>
                  </td>
                  <td className="p-3 text-center tabular-nums">{p.referral_visits}</td>
                  <td className="p-3 text-center tabular-nums">{p.registrations}</td>
                  <td className="p-3 text-right tabular-nums">{(p.totalReward / 100).toFixed(2)} €</td>
                  <td className="p-3 text-right tabular-nums">{(p.paidOut / 100).toFixed(2)} €</td>
                  <td className="p-3 text-right tabular-nums font-semibold text-primary">{(p.pendingReward / 100).toFixed(2)} €</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => recordPayout(p)}
                      disabled={p.pendingReward <= 0 || payingId === p.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg gradient-golden text-primary-foreground text-xs font-semibold disabled:opacity-40"
                    >
                      <Wallet className="w-3.5 h-3.5" /> Vyplatiť
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminReferrals;
