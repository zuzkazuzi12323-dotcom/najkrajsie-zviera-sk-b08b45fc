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

      const exportData = {
        exported_at: new Date().toISOString(),
        email: user.email,
        profile: profileData,
        dogs,
        votes,
        payments,
        comments,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `moje-udaje-${new Date().toISOString().slice(0, 10)}.json`;
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
