import { useState, useRef } from "react";
import { User, Dog, Heart, Settings, Pencil, Upload, Save, X, Link2, Copy, Check, Share2, Eye, MousePointerClick, Wallet } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PUBLIC_SITE_URL = "https://najkrajsie-zviera-sk.lovable.app";

const MyProfile = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editingDog, setEditingDog] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", description: "", breed: "", age: "" });
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);

  // Partner shelter linked to this account (if the user is an approved shelter partner)
  const { data: partnerShelter } = useQuery({
    queryKey: ["my-partner-shelter", user?.id],
    enabled: !!user,
    queryFn: async () => {
      // Link any approved shelter whose contact e-mail matches this account
      await supabase.rpc("claim_shelter_for_user");
      const { data: shelter } = await supabase
        .from("shelters")
        .select("id, name, referral_code, referral_visits")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (!shelter) return null;
      const { data: refs } = await supabase
        .from("shelter_referrals")
        .select("reward_cents, is_paid")
        .eq("shelter_id", (shelter as any).id);
      const { data: payouts } = await supabase
        .from("shelter_payouts")
        .select("amount_cents")
        .eq("shelter_id", (shelter as any).id);
      const registrations = refs?.length || 0;
      const totalReward = (refs || []).reduce((s: number, r: any) => s + (r.reward_cents || 0), 0);
      const paidOut = (payouts || []).reduce((s: number, p: any) => s + (p.amount_cents || 0), 0);
      return {
        ...(shelter as any),
        registrations,
        totalReward,
        pendingReward: Math.max(totalReward - paidOut, 0),
      };
    },
  });

  const partnerLink = partnerShelter ? `${PUBLIC_SITE_URL}/pridat?ref=${partnerShelter.referral_code}` : "";

  const copyPartnerLink = async () => {
    try {
      await navigator.clipboard.writeText(partnerLink);
      setCopied(true);
      toast.success("Partnerský odkaz skopírovaný");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Odkaz sa nepodarilo skopírovať");
    }
  };

  const sharePartnerLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${partnerShelter?.name} – NajkrajšíPes.sk`,
          text: "Zapojte svojho psa do súťaže NajkrajšíPes.sk a podporte náš útulok 🐾",
          url: partnerLink,
        });
      } catch { /* canceled */ }
    } else {
      copyPartnerLink();
    }
  };



  const { data: myDogs = [] } = useQuery({
    queryKey: ["my-dogs", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data: dogsData } = await supabase.from("dogs").select("*").eq("owner_id", user!.id).order("created_at", { ascending: false });
      if (!dogsData) return [];
      const dogIds = dogsData.map((d) => d.id);
      const { data: voteCounts } = await supabase.from("votes").select("dog_id").in("dog_id", dogIds);
      const voteMap: Record<string, number> = {};
      voteCounts?.forEach((v) => { voteMap[v.dog_id] = (voteMap[v.dog_id] || 0) + 1; });
      return dogsData.map((d) => ({ ...d, votes: voteMap[d.id] || 0, total: (voteMap[d.id] || 0) + (d.boost_votes || 0) }));
    },
  });

  const { data: myVotesCount = 0 } = useQuery({
    queryKey: ["my-votes-count", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { count } = await supabase.from("votes").select("*", { count: "exact", head: true }).eq("user_id", user!.id);
      return count || 0;
    },
  });

  if (!user) {
    navigate("/prihlasenie");
    return null;
  }

  const startEdit = (dog: any) => {
    setEditingDog(dog.id);
    setEditForm({ name: dog.name, description: dog.description || "", breed: dog.breed, age: dog.age });
  };

  const saveEdit = async (dogId: string) => {
    const { error } = await supabase.from("dogs").update({
      name: editForm.name, description: editForm.description || null, breed: editForm.breed, age: editForm.age,
    }).eq("id", dogId);
    if (error) { toast.error("Nepodarilo sa uložiť zmeny"); return; }
    toast.success("Zmeny uložené ✅");
    setEditingDog(null);
    queryClient.invalidateQueries({ queryKey: ["my-dogs"] });
  };

  const uploadPhoto = async (dogId: string, file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("dog-images").upload(path, file);
    if (error) { toast.error("Nepodarilo sa nahrať fotku"); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("dog-images").getPublicUrl(path);
    await supabase.from("dogs").update({ image_url: urlData.publicUrl }).eq("id", dogId);
    toast.success("Fotka aktualizovaná 📸");
    setUploading(false);
    queryClient.invalidateQueries({ queryKey: ["my-dogs"] });
  };

  const deleteDog = async (dogId: string) => {
    if (!confirm("Naozaj chcete vymazať tohto psa zo súťaže?")) return;
    await supabase.from("votes").delete().eq("dog_id", dogId);
    await supabase.from("comments").delete().eq("dog_id", dogId);
    const { error } = await supabase.from("dogs").delete().eq("id", dogId);
    if (error) { toast.error("Nepodarilo sa vymazať psa"); return; }
    toast.success("Pes bol vymazaný");
    queryClient.invalidateQueries({ queryKey: ["my-dogs"] });
  };

  const totalVotes = myDogs.reduce((sum, d) => sum + d.total, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-10 max-w-4xl flex-1">
        {/* Profile header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-6 shadow-soft mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full gradient-golden flex items-center justify-center">
              <User className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{profile?.display_name || "Môj profil"}</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <Link to="/nastavenia" className="ml-auto p-2 rounded-lg hover:bg-secondary text-muted-foreground" title="Nastavenia">
              <Settings className="w-5 h-5" />
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 rounded-xl bg-secondary/50">
              <Dog className="w-5 h-5 mx-auto mb-1 text-primary" />
              <p className="text-xl font-bold tabular-nums text-foreground">{myDogs.length}</p>
              <p className="text-xs text-muted-foreground">Moji psy</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-secondary/50">
              <Heart className="w-5 h-5 mx-auto mb-1 text-primary fill-primary" />
              <p className="text-xl font-bold tabular-nums text-foreground">{totalVotes}</p>
              <p className="text-xs text-muted-foreground">Hlasov celkom</p>
            </div>
            <div className="text-center p-3 rounded-xl bg-secondary/50">
              <Heart className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
              <p className="text-xl font-bold tabular-nums text-foreground">{myVotesCount}</p>
              <p className="text-xs text-muted-foreground">Moje hlasy</p>
            </div>
          </div>
        </motion.div>

        {/* Partner referral link (only for approved shelter partners) */}
        {partnerShelter && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-6 shadow-soft mb-8 border border-primary/20">
            <div className="flex items-center gap-2 mb-1">
              <Link2 className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-foreground">Môj partnerský odkaz</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Útulok <strong>{partnerShelter.name}</strong> — zdieľajte tento odkaz. Za každú platenú
              registráciu psa (1,99 €) cez tento odkaz získava útulok 20 % odmenu.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch gap-2 mb-4">
              <div className="flex-1 px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground truncate flex items-center">
                {partnerLink}
              </div>
              <button onClick={copyPartnerLink}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-secondary text-foreground text-sm font-medium hover:bg-secondary/70">
                {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                {copied ? "Skopírované" : "Kopírovať odkaz"}
              </button>
              <button onClick={sharePartnerLink}
                className="flex items-center justify-center gap-2 gradient-golden text-primary-foreground px-4 py-2.5 rounded-xl text-sm font-semibold">
                <Share2 className="w-4 h-4" /> Zdieľať
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-xl bg-secondary/50">
                <Eye className="w-5 h-5 mx-auto mb-1 text-primary" />
                <p className="text-xl font-bold tabular-nums text-foreground">{partnerShelter.referral_visits}</p>
                <p className="text-xs text-muted-foreground">Návštevy</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-secondary/50">
                <MousePointerClick className="w-5 h-5 mx-auto mb-1 text-primary" />
                <p className="text-xl font-bold tabular-nums text-foreground">{partnerShelter.registrations}</p>
                <p className="text-xs text-muted-foreground">Registrácie</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-secondary/50">
                <Wallet className="w-5 h-5 mx-auto mb-1 text-primary" />
                <p className="text-xl font-bold tabular-nums text-foreground">{(partnerShelter.pendingReward / 100).toFixed(2)} €</p>
                <p className="text-xs text-muted-foreground">Na vyplatenie</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* My dogs */}

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">🐕 Moji psy v súťaži</h2>
          <Link to="/pridat" className="gradient-golden text-primary-foreground px-4 py-2 rounded-full text-sm font-semibold">
            + Pridať psa
          </Link>
        </div>

        {myDogs.length === 0 ? (
          <div className="bg-card rounded-2xl p-10 text-center shadow-soft">
            <Dog className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">Zatiaľ ste nepridali žiadneho psa</p>
            <Link to="/pridat" className="gradient-golden text-primary-foreground px-6 py-3 rounded-full font-semibold inline-block">
              Pridať psa do súťaže 🐾
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {myDogs.map((dog) => (
              <motion.div key={dog.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl shadow-soft overflow-hidden">
                <div className="flex flex-col sm:flex-row">
                  <div className="relative sm:w-40 h-40 sm:h-auto flex-shrink-0">
                    <img src={dog.image_url} alt={dog.name} className="w-full h-full object-cover" />
                    <input ref={fileRef} type="file" accept="image/*" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPhoto(dog.id, f); }} />
                    <button onClick={() => fileRef.current?.click()} disabled={uploading}
                      className="absolute bottom-2 right-2 p-2 rounded-full bg-foreground/70 text-background hover:bg-foreground/90 transition-colors disabled:opacity-50" title="Zmeniť fotku">
                      <Upload className="w-4 h-4" />
                    </button>
                    {!dog.approved && (
                      <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-yellow-500 text-white text-xs font-bold">
                        Čaká na schválenie
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex-1">
                    {editingDog === dog.id ? (
                      <div className="space-y-2">
                        <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-input text-foreground text-sm border border-border" placeholder="Meno" />
                        <div className="grid grid-cols-2 gap-2">
                          <input value={editForm.breed} onChange={(e) => setEditForm({ ...editForm, breed: e.target.value })}
                            className="px-3 py-2 rounded-lg bg-input text-foreground text-sm border border-border" placeholder="Plemeno" />
                          <input value={editForm.age} onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                            className="px-3 py-2 rounded-lg bg-input text-foreground text-sm border border-border" placeholder="Vek" />
                        </div>
                        <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-input text-foreground text-sm border border-border" rows={2} placeholder="Popis" />
                        <div className="flex gap-2">
                          <button onClick={() => saveEdit(dog.id)} className="flex items-center gap-1 px-4 py-2 rounded-full gradient-golden text-primary-foreground text-xs font-semibold">
                            <Save className="w-3.5 h-3.5" /> Uložiť
                          </button>
                          <button onClick={() => setEditingDog(null)} className="flex items-center gap-1 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold">
                            <X className="w-3.5 h-3.5" /> Zrušiť
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-1">
                          <Link to={`/pes/${dog.id}`} className="font-bold text-foreground hover:text-primary transition-colors">{dog.name}</Link>
                          <div className="flex items-center gap-1">
                            <button onClick={() => startEdit(dog)} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground" title="Upraviť">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteDog(dog.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive" title="Vymazať">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{dog.breed} · {dog.age}</p>
                        {dog.description && <p className="text-sm text-foreground/70 mb-3 line-clamp-2">{dog.description}</p>}
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5">
                            <Heart className="w-4 h-4 text-primary fill-primary" />
                            <span className="font-bold tabular-nums text-foreground">{dog.total}</span>
                            <span className="text-xs text-muted-foreground">hlasov</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MyProfile;
