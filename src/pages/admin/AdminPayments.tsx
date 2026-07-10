import { useState } from "react";
import { CreditCard, Award, CheckCircle, Trash2, Download, Filter, Mail, RefreshCw } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminPayments = () => {
  const queryClient = useQueryClient();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [resendingId, setResendingId] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const { data } = useQuery({
    queryKey: ["admin-payments"],
    queryFn: async () => {
      const { data: payments } = await supabase.from("payments").select("*").order("created_at", { ascending: false });
      if (!payments) return { items: [], totalRevenue: 0, highlightedCount: 0, pendingCount: 0 };

      const userIds = [...new Set(payments.map((p) => p.user_id))];
      const dogIds = payments.map((p) => p.dog_id).filter(Boolean) as string[];

      const { data: profiles } = await supabase.from("profiles").select("user_id, display_name").in("user_id", userIds);
      const { data: dogs } = dogIds.length > 0
        ? await supabase.from("dogs").select("id, name").in("id", dogIds)
        : { data: [] };

      const profileMap: Record<string, string> = {};
      profiles?.forEach((p) => { profileMap[p.user_id] = p.display_name || "Neznámy"; });
      const dogMap: Record<string, string> = {};
      dogs?.forEach((d) => { dogMap[d.id] = d.name; });

      const items = payments.map((p) => ({
        ...p,
        user_name: profileMap[p.user_id] || "Neznámy",
        dog_name: p.dog_id ? (dogMap[p.dog_id] || "-") : "-",
      }));

      const totalRevenue = items.filter((p) => p.status === "completed").reduce((sum, p) => sum + p.amount, 0);
      const highlightedCount = items.filter((p) => p.type === "highlight" && p.status === "completed").length;
      const pendingCount = items.filter((p) => p.status === "pending").length;

      return { items, totalRevenue, highlightedCount, pendingCount };
    },
  });

  const filteredItems = data?.items.filter((p) => typeFilter === "all" || p.type === typeFilter) || [];

  const { data: emailLogs = [] } = useQuery({
    queryKey: ["admin-email-delivery-log"],
    queryFn: async () => {
      const { data } = await supabase
        .from("email_delivery_log" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);
      return (data || []) as any[];
    },
  });

  const resendEmail = async (log: any) => {
    setResendingId(log.id);
    try {
      const baseBody = {
        email: log.recipient_email,
        amount: log.amount_cents,
        variableSymbol: log.variable_symbol || log.stripe_session_id,
        paymentId: log.payment_id || log.stripe_session_id,
      };
      const functionName = log.payment_type === "registration" ? "send-payment-confirmation" : "send-support-confirmation";
      const body = log.payment_type === "registration"
        ? {
            ...baseBody,
            dogName: String(log.item_name || "Registrácia psa").replace("Registrácia psa: ", "") || "Pes",
            dogId: log.variable_symbol || log.stripe_session_id,
          }
        : {
            ...baseBody,
            type: log.payment_type,
            name: "",
          };

      const { error } = await supabase.functions.invoke(functionName, { body });
      if (error) throw error;

      await supabase.from("email_delivery_log" as any).update({
        status: "sent",
        attempts: Number(log.attempts || 0) + 1,
        sent_at: new Date().toISOString(),
        last_error: null,
      }).eq("id", log.id);

      toast.success("Potvrdenie bolo znovu odoslané");
      queryClient.invalidateQueries({ queryKey: ["admin-email-delivery-log"] });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Odoslanie zlyhalo";
      await supabase.from("email_delivery_log" as any).update({
        status: "failed",
        attempts: Number(log.attempts || 0) + 1,
        last_error: message,
      }).eq("id", log.id);
      toast.error("Nepodarilo sa znovu odoslať e-mail");
      queryClient.invalidateQueries({ queryKey: ["admin-email-delivery-log"] });
    } finally {
      setResendingId(null);
    }
  };

  const approvePayment = async (payment: any) => {
    setLoadingId(payment.id);
    try {
      const { error } = await supabase.from("payments").update({ status: "completed" }).eq("id", payment.id);
      if (error) throw error;
      if (payment.type === "registration" && payment.dog_id) {
        await supabase.from("dogs").update({ approved: true }).eq("id", payment.dog_id);
      }
      const donationId = "00000000-0000-0000-0000-000000000001";
      const { data: dt } = await supabase.from("donations_total").select("total_cents").eq("id", donationId).single();
      await supabase
        .from("donations_total")
        .update({ total_cents: (dt?.total_cents || 0) + Math.round((payment.amount * 20) / 100) })
        .eq("id", donationId);
      toast.success("Platba schválená");
      queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dogs"] });
    } catch {
      toast.error("Nepodarilo sa schváliť platbu");
    } finally {
      setLoadingId(null);
    }
  };

  const rejectPayment = async (payment: any) => {
    setLoadingId(payment.id);
    try {
      const { error } = await supabase.from("payments").update({ status: "failed" }).eq("id", payment.id);
      if (error) throw error;
      toast.success("Platba odmietnutá");
      queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
    } catch {
      toast.error("Nepodarilo sa odmietnuť platbu");
    } finally {
      setLoadingId(null);
    }
  };

  const deletePayment = async (id: string) => {
    if (!confirm("Naozaj chcete vymazať túto platbu? Táto akcia je nezvratná.")) return;
    setLoadingId(id);
    try {
      const { error } = await supabase.from("payments").delete().eq("id", id);
      if (error) throw error;
      toast.success("Platba vymazaná");
      queryClient.invalidateQueries({ queryKey: ["admin-payments"] });
    } catch {
      toast.error("Nepodarilo sa vymazať platbu");
    } finally {
      setLoadingId(null);
    }
  };

  const exportCSV = () => {
    if (!filteredItems.length) { toast.error("Žiadne platby na export"); return; }
    const headers = ["Používateľ", "Typ", "Pes/Produkt", "Suma (€)", "Stav", "Dátum"];
    const rows = filteredItems.map((p) => [
      p.user_name,
      typeLabels[p.type] || p.type,
      p.product_name || p.dog_name,
      (p.amount / 100).toFixed(2),
      p.status === "completed" ? "Zaplatené" : p.status === "pending" ? "Čaká" : "Zlyhalo",
      new Date(p.created_at).toLocaleDateString("sk"),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `platby-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportované");
  };

  const typeLabels: Record<string, string> = {
    highlight: "Zvýraznenie",
    registration: "Registrácia",
    product: "Nákup produktu",
    donation: "Príspevok",
  };

  const typeFilters = [
    { key: "all", label: "Všetky" },
    { key: "registration", label: "Registrácie" },
    { key: "donation", label: "Príspevky" },
    { key: "highlight", label: "Zvýraznenia" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl p-5 shadow-soft flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums text-card-foreground">{((data?.totalRevenue || 0) / 100).toFixed(2)} €</p>
            <p className="text-sm text-muted-foreground">Celkové príjmy</p>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-5 shadow-soft flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums text-card-foreground">{data?.pendingCount || 0}</p>
            <p className="text-sm text-muted-foreground">Čakajúce platby</p>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-5 shadow-soft flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Award className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold tabular-nums text-card-foreground">{data?.highlightedCount || 0}</p>
            <p className="text-sm text-muted-foreground">Zvýraznení psy</p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-soft overflow-hidden">
        <div className="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Filter className="w-4 h-4" /> Prehľad platieb
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            {typeFilters.map((f) => (
              <button key={f.key} onClick={() => setTypeFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  typeFilter === f.key ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}>
                {f.label}
              </button>
            ))}
            <button onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-600 text-white hover:bg-green-700 transition-colors">
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Používateľ</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Typ</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Pes / Produkt</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Suma</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Stav</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Dátum</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Akcie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredItems.map((payment) => (
                <tr key={payment.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-foreground">{payment.user_name}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      payment.type === "highlight" ? "bg-primary/10 text-primary" :
                      payment.type === "product" ? "bg-blue-100 text-blue-700" :
                      payment.type === "donation" ? "bg-pink-100 text-pink-700" :
                      "bg-secondary text-secondary-foreground"
                    }`}>
                      {typeLabels[payment.type] || payment.type}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">
                    {payment.product_name || payment.dog_name}
                  </td>
                  <td className="px-5 py-3 text-sm tabular-nums font-medium text-foreground">{(payment.amount / 100).toFixed(2)} €</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      payment.status === "completed" ? "bg-green-100 text-green-700" :
                      payment.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                    }`}>
                      {payment.status === "completed" ? "Zaplatené" : payment.status === "pending" ? "Čaká" : "Zlyhalo"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{new Date(payment.created_at).toLocaleDateString("sk")}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {payment.status === "pending" && (
                        <>
                          <button
                            onClick={() => approvePayment(payment)}
                            disabled={loadingId === payment.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                            title="Schváliť"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            {loadingId === payment.id ? "..." : "Schváliť"}
                          </button>
                          <button
                            onClick={() => rejectPayment(payment)}
                            disabled={loadingId === payment.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold bg-yellow-600 text-white hover:bg-yellow-700 transition-colors disabled:opacity-50"
                            title="Odmietnuť"
                          >
                            Odmietnuť
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => deletePayment(payment.id)}
                        disabled={loadingId === payment.id}
                        className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                        title="Vymazať"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredItems.length === 0 && <p className="text-center py-10 text-muted-foreground">Žiadne platby</p>}
      </div>

      <div className="bg-card rounded-2xl shadow-soft overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between gap-3">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Mail className="w-4 h-4" /> Odoslané platobné potvrdenia
          </h3>
          <button onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-email-delivery-log"] })} className="p-2 rounded-lg hover:bg-secondary text-muted-foreground" title="Obnoviť">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Čas</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">E-mail</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Typ / ID</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Stav</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Akcia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {emailLogs.map((log) => (
                <tr key={log.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-3 text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString("sk")}
                  </td>
                  <td className="px-5 py-3 text-sm font-medium text-foreground">{log.recipient_email}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">
                    <div>{typeLabels[log.payment_type] || log.payment_type}</div>
                    <div className="text-xs tabular-nums">VS/ID: {log.variable_symbol || log.stripe_session_id}</div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      log.status === "sent" ? "bg-green-100 text-green-700" :
                      log.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                    }`}>
                      {log.status === "sent" ? "Odoslané" : log.status === "pending" ? "Čaká" : "Zlyhalo"}
                    </span>
                    {log.last_error && <p className="text-xs text-destructive mt-1 max-w-xs truncate" title={log.last_error}>{log.last_error}</p>}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => resendEmail(log)}
                      disabled={resendingId === log.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50"
                    >
                      <Mail className="w-3.5 h-3.5" /> {resendingId === log.id ? "Odosielam..." : "Znovu odoslať"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {emailLogs.length === 0 && <p className="text-center py-10 text-muted-foreground">Zatiaľ žiadne odoslané potvrdenia</p>}
      </div>
    </div>
  );
};

export default AdminPayments;
