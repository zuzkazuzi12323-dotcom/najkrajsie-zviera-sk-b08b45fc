import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, XCircle, AlertCircle, Trash2, Clock, Mail, Phone, MapPin, ExternalLink, Landmark, Send, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type EmailLog = { status: string; sent_at: string; message_id?: string };

type Application = {
  id: string;
  name: string;
  city: string | null;
  description: string | null;
  logo_url: string | null;
  support_url: string | null;
  iban: string | null;
  bank_holder: string | null;
  contact_name: string | null;
  contact_email: string;
  contact_phone: string | null;
  status: "pending" | "needs_info" | "approved" | "rejected";
  admin_note: string | null;
  agreed_terms: boolean;
  email_history: EmailLog[] | null;
  created_at: string;
};

const STATUS: Record<Application["status"], { label: string; className: string }> = {
  pending: { label: "Na spracovanie", className: "bg-amber-100 text-amber-800" },
  needs_info: { label: "Vyžaduje doplnenie", className: "bg-blue-100 text-blue-800" },
  approved: { label: "Schválené", className: "bg-green-100 text-green-800" },
  rejected: { label: "Zamietnuté", className: "bg-red-100 text-red-800" },
};

const EMAILABLE = ["needs_info", "approved", "rejected"] as const;
type EmailableStatus = (typeof EMAILABLE)[number];

const AdminShelterApplications = () => {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<"all" | Application["status"]>("all");
  const [sendingId, setSendingId] = useState<string | null>(null);

  const { data: apps = [] } = useQuery({
    queryKey: ["admin-shelter-applications"],
    queryFn: async () => {
      const { data } = await supabase
        .from("shelter_applications")
        .select("*")
        .order("created_at", { ascending: false });
      return (data || []) as unknown as Application[];
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-shelter-applications"] });
  };

  // Sends (or resends) the status notification email and reports the outcome clearly
  const sendStatusEmail = async (app: Application, status: EmailableStatus) => {
    setSendingId(app.id + status);
    const toastId = toast.loading(`Odosielam e-mail na ${app.contact_email}...`);
    try {
      const { data, error } = await supabase.functions.invoke("send-shelter-status-email", {
        body: { applicationId: app.id, status },
      });
      // Try to surface the exact backend failure reason instead of a generic message
      let backendError: string | null = null;
      if (error) {
        // FunctionsHttpError carries the response body in `context`
        try {
          const ctx = (error as any).context;
          if (ctx && typeof ctx.json === "function") {
            const body = await ctx.json();
            backendError = body?.error || null;
          }
        } catch {
          /* ignore parse errors */
        }
        throw new Error(backendError || error.message);
      }
      if (data && (data as any).success === false) {
        throw new Error((data as any).error || "Neznáma chyba servera");
      }
      toast.success(`E-mail bol úspešne odoslaný na ${app.contact_email}`, { id: toastId });
      invalidate();
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Neznáma chyba";
      toast.error(`E-mail sa nepodarilo odoslať: ${msg}`, { id: toastId, duration: 8000 });
      return false;
    } finally {
      setSendingId(null);
    }
  };

  // Automatically emails the shelter its unique partner referral link
  const sendPartnerEmail = async (shelterId: string, email: string) => {
    const toastId = toast.loading(`Odosielam partnerský odkaz na ${email}...`);
    try {
      const { data, error } = await supabase.functions.invoke("send-shelter-partner-email", {
        body: { shelterId },
      });
      if (error) throw new Error(error.message);
      if (data && (data as any).success === false) throw new Error((data as any).error || "Neznáma chyba");
      toast.success(`Partnerský odkaz bol odoslaný na ${email}`, { id: toastId });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Neznáma chyba";
      toast.error(`Partnerský e-mail sa nepodarilo odoslať: ${msg}`, { id: toastId, duration: 8000 });
    }
  };

  const setStatus = async (app: Application, status: Application["status"]) => {
    const { error } = await supabase
      .from("shelter_applications")
      .update({ status } as any)
      .eq("id", app.id);
    if (error) {
      toast.error("Chyba pri zmene stavu");
      return;
    }
    if (status === "approved") {
      // Look up the applicant's user account (if they already registered) to link the shelter
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id")
        .ilike("email", app.contact_email)
        .maybeSingle();
      const linkedUserId = (profile as any)?.user_id || null;

      // Add to approved shelters (only once)
      let shelterId: string | null = null;
      const { data: existing } = await supabase
        .from("shelters")
        .select("id")
        .eq("name", app.name)
        .maybeSingle();
      if (existing) {
        shelterId = (existing as any).id;
        await supabase
          .from("shelters")
          .update({ contact_email: app.contact_email, user_id: linkedUserId } as any)
          .eq("id", shelterId);
      } else {
        const { data: maxRow } = await supabase
          .from("shelters")
          .select("display_order")
          .order("display_order", { ascending: false })
          .limit(1)
          .maybeSingle();
        const nextOrder = ((maxRow as any)?.display_order || 0) + 1;
        const { data: insRow, error: insErr } = await supabase
          .from("shelters")
          .insert({
            name: app.name,
            city: app.city,
            description: app.description,
            logo_url: app.logo_url,
            support_url: app.support_url,
            iban: app.iban,
            bank_holder: app.bank_holder,
            contact_email: app.contact_email,
            user_id: linkedUserId,
            active: true,
            featured: false,
            show_iban: !!app.iban,
            display_order: nextOrder,
          } as any)
          .select("id")
          .single();
        if (insErr) toast.error("Stav zmenený, ale útulok sa nepodarilo pridať");
        else {
          shelterId = (insRow as any)?.id || null;
          queryClient.invalidateQueries({ queryKey: ["admin-shelters"] });
          queryClient.invalidateQueries({ queryKey: ["active-shelters"] });
        }
      }
      queryClient.invalidateQueries({ queryKey: ["admin-partner-referrals"] });
      toast.success("Žiadosť schválená a útulok pridaný");
      invalidate();
      // Automatically email the shelter its unique partner referral link
      if (shelterId) await sendPartnerEmail(shelterId, app.contact_email);
      return;
    }

    toast.success(`Stav zmenený: ${STATUS[status].label}`);
    invalidate();
    // Automatically send the notification email for emailable states
    if ((EMAILABLE as readonly string[]).includes(status)) {
      await sendStatusEmail(app, status as EmailableStatus);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Naozaj vymazať žiadosť? Nezverejní sa nikde.")) return;
    const { error } = await supabase.from("shelter_applications").delete().eq("id", id);
    if (error) {
      toast.error("Chyba pri mazaní");
      return;
    }
    invalidate();
    toast.success("Žiadosť vymazaná");
  };

  const filtered = filter === "all" ? apps : apps.filter((a) => a.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Žiadosti útulkov</h1>
        <p className="text-sm text-muted-foreground">
          Prihlášky útulkov o spoluprácu. Po schválení sa útulok automaticky pridá medzi schválené útulky. Pri zmene stavu sa automaticky odošle notifikačný e-mail žiadateľovi.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", "pending", "needs_info", "approved", "rejected"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              filter === f ? "gradient-golden text-primary-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {f === "all" ? "Všetky" : STATUS[f].label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-2xl p-10 text-center border border-border text-muted-foreground">
          Žiadne žiadosti v tejto kategórii.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((app) => {
            const history = (app.email_history || []).slice().sort((a, b) => b.sent_at.localeCompare(a.sent_at));
            const lastSent = history[0];
            return (
              <div key={app.id} className="bg-card rounded-2xl p-5 border border-border">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-4">
                    {app.logo_url && (
                      <div className="w-16 h-16 bg-white rounded-xl border border-border flex items-center justify-center p-2 shrink-0">
                        <img src={app.logo_url} alt={app.name} className="max-w-full max-h-full object-contain" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-foreground">{app.name}</h3>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${STATUS[app.status].className}`}>
                          {STATUS[app.status].label}
                        </span>
                      </div>
                      {app.city && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5" /> {app.city}
                        </p>
                      )}
                      {app.description && <p className="text-sm text-muted-foreground mt-2 text-pretty">{app.description}</p>}
                      <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                        <p className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {app.contact_email}{app.contact_name ? ` (${app.contact_name})` : ""}</p>
                        {app.contact_phone && <p className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {app.contact_phone}</p>}
                        {app.iban && <p className="flex items-center gap-1"><Landmark className="w-3.5 h-3.5" /> {app.iban}{app.bank_holder ? ` – ${app.bank_holder}` : ""}</p>}
                        {app.support_url && (
                          <a href={app.support_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                            <ExternalLink className="w-3.5 h-3.5" /> {app.support_url}
                          </a>
                        )}
                        <p className="flex items-center gap-1 text-xs"><Clock className="w-3 h-3" /> {new Date(app.created_at).toLocaleString("sk")}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email history */}
                <div className="mt-4 bg-secondary/50 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <History className="w-3.5 h-3.5" /> História odoslaných e-mailov
                  </div>
                  {history.length === 0 ? (
                    <p className="text-xs text-muted-foreground mt-1">Zatiaľ nebol odoslaný žiadny e-mail.</p>
                  ) : (
                    <>
                      <p className="text-xs text-muted-foreground mt-1">
                        Naposledy odoslané: <strong>{STATUS[lastSent.status as Application["status"]]?.label || lastSent.status}</strong> — {new Date(lastSent.sent_at).toLocaleString("sk")}
                      </p>
                      <ul className="mt-2 space-y-1">
                        {history.map((h, i) => (
                          <li key={i} className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                            <span className={`inline-block w-1.5 h-1.5 rounded-full ${STATUS[h.status as Application["status"]]?.className || "bg-muted"}`} />
                            {STATUS[h.status as Application["status"]]?.label || h.status} — {new Date(h.sent_at).toLocaleString("sk")}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {/* Resend buttons */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {EMAILABLE.map((s) => (
                      <button
                        key={s}
                        onClick={() => sendStatusEmail(app, s)}
                        disabled={sendingId === app.id + s}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-card hover:bg-secondary disabled:opacity-50"
                      >
                        <Send className="w-3 h-3" /> Znovu odoslať: {STATUS[s].label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4 border-t border-border pt-4">
                  <button onClick={() => setStatus(app, "approved")} disabled={app.status === "approved"}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-green-600 text-white disabled:opacity-40">
                    <CheckCircle2 className="w-4 h-4" /> Schváliť
                  </button>
                  <button onClick={() => setStatus(app, "needs_info")}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-blue-300 text-blue-700 hover:bg-blue-50">
                    <AlertCircle className="w-4 h-4" /> Vyžiadať doplnenie
                  </button>
                  <button onClick={() => setStatus(app, "rejected")}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-red-300 text-red-700 hover:bg-red-50">
                    <XCircle className="w-4 h-4" /> Zamietnuť
                  </button>
                  <button onClick={() => handleDelete(app.id)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-destructive/30 text-destructive hover:bg-destructive/10 ml-auto">
                    <Trash2 className="w-4 h-4" /> Vymazať
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminShelterApplications;
