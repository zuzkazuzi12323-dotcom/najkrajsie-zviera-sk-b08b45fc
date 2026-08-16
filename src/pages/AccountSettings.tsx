import { useState } from "react";
import { Settings, Trash2, Download, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const AccountSettings = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const formatDate = (dateStr: string) => {
    try { return new Date(dateStr).toLocaleDateString("sk-SK", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }); }
    catch { return dateStr; }
  };

  const handleExport = async () => {
    if (!user) return;
    setExporting(true);
    try {
      const [{ data: profileData }, { data: dogs }, { data: votes }, { data: payments }, { data: comments }] = await Promise.all([
        supabase.from("profiles").select("*").eq("user_id", user.id),
        supabase.from("dogs").select("*").eq("owner_id", user.id),
        supabase.from("votes").select("*").eq("user_id", user.id),
        supabase.from("payments").select("*").eq("user_id", user.id),
        supabase.from("comments").select("*").eq("user_id", user.id),
      ]);

      const css = `
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#1a1a1a;padding:40px;max-width:800px;margin:0 auto;line-height:1.6}
        .header{text-align:center;border-bottom:3px solid #e8a020;padding-bottom:24px;margin-bottom:32px}
        .header h1{font-size:28px;color:#1a1a1a;margin-bottom:4px}
        .header .logo{font-size:14px;color:#e8a020;font-weight:600;letter-spacing:1px}
        .header .date{font-size:13px;color:#888;margin-top:8px}
        .section{margin-bottom:28px}
        .section h2{font-size:18px;color:#1a1a1a;border-left:4px solid #e8a020;padding-left:12px;margin-bottom:14px}
        table{width:100%;border-collapse:collapse;margin-bottom:8px;font-size:14px}
        th{background:#fdf6e8;text-align:left;padding:10px 14px;font-weight:600;color:#333;border-bottom:2px solid #e8a020}
        td{padding:9px 14px;border-bottom:1px solid #eee;color:#444}
        tr:hover td{background:#fefcf6}
        .info-row{display:flex;gap:8px;margin-bottom:6px;font-size:14px}
        .info-label{font-weight:600;color:#555;min-width:100px}
        .info-value{color:#1a1a1a}
        .empty{color:#999;font-style:italic;font-size:14px;padding:12px 0}
        .footer{text-align:center;margin-top:40px;padding-top:20px;border-top:1px solid #eee;font-size:12px;color:#aaa}
      `;

      const tableRow = (cells: string[]) => `<tr>${cells.map(c => `<td>${c}</td>`).join("")}</tr>`;
      const tableHead = (cells: string[]) => `<tr>${cells.map(c => `<th>${c}</th>`).join("")}</tr>`;

      const p = profileData?.[0];
      const dogsHtml = dogs && dogs.length > 0
        ? `<table>${tableHead(["Meno", "Plemeno", "Vek", "Schválený", "Pridaný"])}${dogs.map(d => tableRow([d.name, d.breed, d.age, d.approved ? "✅ Áno" : "❌ Nie", formatDate(d.created_at)])).join("")}</table>`
        : `<p class="empty">Žiadne psy</p>`;

      const votesHtml = votes && votes.length > 0
        ? `<table>${tableHead(["ID hlasovania", "Dátum"])}${votes.map(v => tableRow([v.id.slice(0, 8) + "...", formatDate(v.created_at)])).join("")}</table>`
        : `<p class="empty">Žiadne hlasy</p>`;

      const paymentsHtml = payments && payments.length > 0
        ? `<table>${tableHead(["Typ", "Suma", "Stav", "Dátum"])}${payments.map(p => tableRow([p.type, (p.amount / 100).toFixed(2) + " €", p.status === "completed" ? "✅ Zaplatené" : p.status === "pending" ? "⏳ Čaká" : "❌ Zlyhalo", formatDate(p.created_at)])).join("")}</table>`
        : `<p class="empty">Žiadne platby</p>`;

      const commentsHtml = comments && comments.length > 0
        ? `<table>${tableHead(["Komentár", "Dátum"])}${comments.map(c => tableRow([c.text, formatDate(c.created_at)])).join("")}</table>`
        : `<p class="empty">Žiadne komentáre</p>`;

      const html = `<!DOCTYPE html><html lang="sk"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Moje údaje – NajkrajšíPes.eu</title><style>${css}</style></head><body>
        <div class="header">
          <div class="logo">🐾 NAJKRAJŠÍPES.SK</div>
          <h1>Export osobných údajov</h1>
          <div class="date">Vygenerované: ${formatDate(new Date().toISOString())}</div>
        </div>
        <div class="section"><h2>👤 Osobné údaje</h2>
          <div class="info-row"><span class="info-label">Email:</span><span class="info-value">${user.email || "-"}</span></div>
          <div class="info-row"><span class="info-label">Meno:</span><span class="info-value">${p?.display_name || "Neuvedené"}</span></div>
          <div class="info-row"><span class="info-label">Registrácia:</span><span class="info-value">${p ? formatDate(p.created_at) : "-"}</span></div>
        </div>
        <div class="section"><h2>🐕 Moje psy</h2>${dogsHtml}</div>
        <div class="section"><h2>🗳️ Moje hlasy</h2>${votesHtml}</div>
        <div class="section"><h2>💳 Moje platby</h2>${paymentsHtml}</div>
        <div class="section"><h2>💬 Moje komentáre</h2>${commentsHtml}</div>
        <div class="footer">Tento dokument bol automaticky vygenerovaný zo stránky NajkrajšíPes.eu<br>Vaše údaje sú chránené podľa GDPR (Nariadenie EÚ 2016/679)</div>
      </body></html>`;

      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `moje-udaje-${new Date().toISOString().slice(0, 10)}.html`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Údaje boli exportované");
    } catch {
      toast.error("Nepodarilo sa exportovať údaje");
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    if (!user) return;
    setDeleting(true);
    try {
      const { error } = await supabase.functions.invoke("delete-account");
      if (error) throw error;
      await signOut();
      navigate("/");
      toast.success("Váš účet a všetky údaje boli vymazané");
    } catch {
      toast.error("Nepodarilo sa vymazať účet. Kontaktujte nás na infonajkrajsipes@gmail.com");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (!user) {
    navigate("/prihlasenie");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-10 max-w-2xl flex-1">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl gradient-golden flex items-center justify-center">
            <Settings className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Nastavenia účtu</h1>
        </div>

        <div className="space-y-6">
          {/* Profile info */}
          <div className="bg-card rounded-2xl p-6 shadow-soft">
            <h2 className="font-bold text-foreground mb-3">Osobné údaje</h2>
            <div className="space-y-2 text-sm">
              <p><span className="text-muted-foreground">Email:</span> <span className="text-foreground">{user.email}</span></p>
              <p><span className="text-muted-foreground">Meno:</span> <span className="text-foreground">{profile?.display_name || "Neuvedené"}</span></p>
            </div>
          </div>

          {/* Export data */}
          <div className="bg-card rounded-2xl p-6 shadow-soft">
            <h2 className="font-bold text-foreground mb-2">Export údajov</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Stiahnite si všetky vaše osobné údaje vo formáte JSON (profil, psy, hlasy, platby, komentáre).
            </p>
            <button onClick={handleExport} disabled={exporting}
              className="flex items-center gap-2 bg-secondary text-secondary-foreground px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-secondary/80 transition-colors disabled:opacity-50">
              <Download className="w-4 h-4" />
              {exporting ? "Exportujem..." : "Stiahnuť moje údaje"}
            </button>
          </div>

          {/* Delete account */}
          <div className="bg-card rounded-2xl p-6 shadow-soft border border-destructive/20">
            <h2 className="font-bold text-destructive mb-2">Vymazanie účtu</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Po vymazaní účtu budú natrvalo odstránené všetky vaše údaje vrátane profilu, psov, hlasov a komentárov. Túto akciu nie je možné vrátiť späť.
            </p>
            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-2 bg-destructive text-destructive-foreground px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-destructive/90 transition-colors">
                <Trash2 className="w-4 h-4" /> Vymazať môj účet
              </button>
            ) : (
              <div className="bg-destructive/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  <p className="text-sm font-semibold text-destructive">Naozaj chcete vymazať svoj účet?</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleDelete} disabled={deleting}
                    className="bg-destructive text-destructive-foreground px-5 py-2 rounded-full text-sm font-semibold disabled:opacity-50">
                    {deleting ? "Mazanie..." : "Áno, vymazať"}
                  </button>
                  <button onClick={() => setConfirmDelete(false)}
                    className="bg-secondary text-secondary-foreground px-5 py-2 rounded-full text-sm font-semibold">
                    Zrušiť
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AccountSettings;
