import { useParams, Link } from "react-router-dom";
import { Heart, ArrowLeft, MessageCircle, Calendar, Award, Send, Share2, Reply, Rocket, BadgeCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useContestActive } from "@/hooks/useContestActive";
import { toast } from "sonner";


const DogProfile = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const contestActive = useContestActive();
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [voted, setVoted] = useState(false);
  const [voteCount, setVoteCount] = useState(0);
  const [shareOpen, setShareOpen] = useState(false);
  const [boostOpen, setBoostOpen] = useState(false);

  const { data: dog, isLoading } = useQuery({
    queryKey: ["dog", id],
    queryFn: async () => {
      const { data } = await supabase.from("dogs").select("*").eq("id", id!).single();
      if (!data) return null;
      const { data: profile } = await supabase.from("profiles").select("display_name").eq("user_id", data.owner_id).single();
      const { count } = await supabase.from("votes").select("*", { count: "exact", head: true }).eq("dog_id", id!);
      const boostVotes = (data as any).boost_votes || 0;
      return { ...data, owner_name: profile?.display_name || "Neznámy", votes: count || 0, boost_votes: boostVotes };
    },
  });

  const { data: comments = [] } = useQuery({
    queryKey: ["comments", id],
    queryFn: async () => {
      const { data } = await supabase.from("comments").select("*").eq("dog_id", id!).order("created_at", { ascending: false });
      if (!data) return [];
      const userIds = [...new Set(data.map((c) => c.user_id))];
      const [{ data: profiles }, { data: roles }] = await Promise.all([
        supabase.from("profiles").select("user_id, display_name").in("user_id", userIds),
        supabase.from("user_roles").select("user_id, role").in("user_id", userIds),
      ]);
      const profileMap: Record<string, string> = {};
      profiles?.forEach((p) => { profileMap[p.user_id] = p.display_name || "Neznámy"; });
      const adminSet = new Set<string>();
      roles?.forEach((r) => { if (r.role === "admin") adminSet.add(r.user_id); });
      return data.map((c) => ({ ...c, user_name: profileMap[c.user_id] || "Neznámy", is_admin: adminSet.has(c.user_id) }));
    },
  });

  const { data: userVoted } = useQuery({
    queryKey: ["user-vote", id, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("votes").select("id").eq("user_id", user!.id).eq("dog_id", id!).maybeSingle();
      return !!data;
    },
  });

  const totalVotes = voteCount + (dog?.boost_votes || 0);
  useEffect(() => { if (dog) setVoteCount(dog.votes); }, [dog]);
  useEffect(() => { if (userVoted !== undefined) setVoted(userVoted); }, [userVoted]);

  const [boostLoading, setBoostLoading] = useState(false);

  const handleBoost = async (pkg: typeof BOOST_PACKAGES[0]) => {
    if ((dog as any)?.archived) { toast.info("Tento pes už súťažil v predchádzajúcom kole."); return; }
    if (!user) { toast.error("Pre boost sa musíte prihlásiť"); return; }
    setBoostLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-boost-checkout", {
        body: { dogId: dog?.id, dogName: dog?.name, amount: pkg.amount },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch {
      toast.error("Nepodarilo sa vytvoriť platbu");
    } finally {
      setBoostLoading(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex flex-col"><Navbar /><div className="flex-1 flex items-center justify-center"><p className="text-muted-foreground">Načítavam...</p></div></div>;
  }
  if (!dog) {
    return <div className="min-h-screen flex flex-col"><Navbar /><div className="flex-1 flex items-center justify-center"><div className="text-center"><p className="text-2xl font-bold text-foreground mb-2">Pes nebol nájdený</p><Link to="/galeria" className="text-primary font-medium">Späť na galériu</Link></div></div></div>;
  }

  const handleVote = async () => {
    if (dog.archived) { toast.info("Tento pes už súťažil v predchádzajúcom kole."); return; }
    if (!contestActive) { toast.error("Súťaž je momentálne ukončená"); return; }
    if (!user) { toast.error("Pre hlasovanie sa musíte prihlásiť"); return; }
    if (voted) {
      await supabase.from("votes").delete().eq("user_id", user.id).eq("dog_id", dog.id);
      setVoteCount((v) => v - 1); setVoted(false); toast.info("Hlas bol odobratý");
    } else {
      const { error } = await supabase.from("votes").insert({ user_id: user.id, dog_id: dog.id });
      if (error) { toast.error(error.message || "Nepodarilo sa hlasovať"); return; }
      setVoteCount((v) => v + 1); setVoted(true); toast.success("Hlas započítaný! 🐾");
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;
    if (!user) { toast.error("Pre komentovanie sa musíte prihlásiť"); return; }
    const text = replyTo ? `@${replyTo.name} ${newComment.trim()}` : newComment.trim();
    const { error } = await supabase.from("comments").insert({ dog_id: dog.id, user_id: user.id, text });
    if (error) { toast.error("Nepodarilo sa pridať komentár"); return; }
    setNewComment("");
    setReplyTo(null);
    queryClient.invalidateQueries({ queryKey: ["comments", id] });
    toast.success("Komentár pridaný!");
  };

  const publishedDomain = "https://najkrajsie-zviera-sk.lovable.app";
  const ogDogUrl = `${publishedDomain}/functions/v1/og-dog?id=${dog.id}`;
  const dogUrl = `${publishedDomain}/pes/${dog.id}`;
  const shareText = `Hlasuj za ${dog.name} v súťaži NajkrajšíPes.sk! 🐾`;

  const shareLinks = [
    { name: "Facebook", url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(ogDogUrl)}&quote=${encodeURIComponent(shareText)}`, color: "bg-[#1877F2]" },
    { name: "Messenger", url: `https://www.facebook.com/dialog/send?link=${encodeURIComponent(ogDogUrl)}&app_id=966242223397117&redirect_uri=${encodeURIComponent(dogUrl)}`, color: "bg-[#0099FF]" },
    { name: "WhatsApp", url: `https://wa.me/?text=${encodeURIComponent(shareText + "\n" + ogDogUrl)}`, color: "bg-[#25D366]" },
    { name: "Kopírovať", url: null, color: "bg-secondary text-secondary-foreground" },
  ];

  const handleShare = (link: typeof shareLinks[0]) => {
    if (link.url) {
      window.open(link.url, "_blank", "width=600,height=400");
    } else {
      navigator.clipboard.writeText(`${shareText}\n${dogUrl}`);
      toast.success("Odkaz skopírovaný!");
    }
    setShareOpen(false);
  };

  const renderCommentText = (text: string) => {
    const mentionRegex = /(@\S+)/g;
    const parts = text.split(mentionRegex);
    return parts.map((part, i) =>
      mentionRegex.test(part) ? <span key={i} className="text-primary font-semibold">{part}</span> : part
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Link to="/galeria" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Späť na galériu
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="relative">
            <img src={dog.image_url} alt={dog.name} className="w-full aspect-[3/4] object-cover rounded-3xl shadow-elevated" />
            {dog.highlighted && (
              <div className="absolute top-4 left-4 flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-golden">
                <Award className="w-4 h-4" /> Top Kandidát
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-2">{dog.name}</h1>
            <p className="text-lg text-muted-foreground mb-6">{dog.breed} · {dog.age}</p>
            <p className="text-foreground/80 text-pretty mb-8 leading-relaxed">{dog.description}</p>

            {dog.archived && (
              <div className="mb-6 p-4 rounded-2xl border border-amber-200 bg-amber-50 text-amber-900 flex items-start gap-3">
                <Award className="w-5 h-5 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Tento pes už súťažil v predchádzajúcom kole.</p>
                  <p className="text-sm">Profil je verejne dostupný v galérii, ale ďalšie hlasovanie ani boost už nie sú možné.</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 mb-4">
              <motion.button onClick={handleVote} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                disabled={!contestActive || dog.archived}
                className={`flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg shadow-lg transition-colors ${
                  !contestActive || dog.archived ? "bg-muted text-muted-foreground cursor-not-allowed" :
                  voted ? "gradient-golden text-primary-foreground shadow-golden" : "bg-card text-card-foreground border border-border hover:border-primary"
                }`}>
                <Heart className={`w-5 h-5 ${voted ? "fill-current" : ""}`} /> {dog.archived ? "Archivovaný" : contestActive ? "Hlasovať" : "Ukončená"}
              </motion.button>
              <div className="text-center">
                <AnimatePresence mode="wait">
                  <motion.p key={totalVotes} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="text-3xl font-bold tabular-nums text-foreground">{totalVotes}</motion.p>
                </AnimatePresence>
                <p className="text-sm text-muted-foreground">hlasov</p>
              </div>
            </div>

            {/* Boost packages removed */}

            {/* Share button */}
            <div className="relative mb-8">
              <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShareOpen(!shareOpen)}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-secondary text-secondary-foreground font-medium hover:bg-secondary/80 transition-colors">
                <Share2 className="w-4 h-4" /> Zdieľať psa
              </motion.button>
              <AnimatePresence>
                {shareOpen && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                    className="absolute top-full left-0 mt-2 flex flex-wrap gap-2 z-10">
                    {shareLinks.map((link) => (
                      <button key={link.name} onClick={() => handleShare(link)}
                        className={`${link.color} text-white px-4 py-2 rounded-full text-sm font-medium hover:opacity-90 transition-opacity`}>
                        {link.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Pridaný {new Date(dog.created_at).toLocaleDateString("sk")}</span>
              <span>Majiteľ: {dog.owner_name}</span>
            </div>

            <div>
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" /> Komentáre ({comments.length})
              </h3>
              {user ? (
                <div className="mb-6">
                  {replyTo && (
                    <div className="flex items-center gap-2 mb-2 text-sm text-primary">
                      <Reply className="w-3.5 h-3.5" />
                      <span>Odpovedáte používateľovi <strong>{replyTo.name}</strong></span>
                      <button onClick={() => setReplyTo(null)} className="text-muted-foreground hover:text-foreground ml-1">✕</button>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <input type="text" placeholder={replyTo ? `Odpoveď pre @${replyTo.name}...` : "Napíšte komentár..."} value={newComment} onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleComment()}
                      className="flex-1 px-4 py-3 rounded-xl bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-shadow" maxLength={500} />
                    <motion.button whileTap={{ scale: 0.95 }} onClick={handleComment} className="px-4 py-3 rounded-xl gradient-golden text-primary-foreground">
                      <Send className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mb-6"><Link to="/prihlasenie" className="text-primary hover:underline">Prihláste sa</Link> pre pridanie komentára.</p>
              )}
              <div className="space-y-3">
                {comments.map((comment) => (
                  <motion.div key={comment.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-secondary/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm text-foreground">{comment.user_name}</span>
                        {comment.is_admin && (
                          <BadgeCheck className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {user && (
                          <button onClick={() => setReplyTo({ id: comment.id, name: comment.user_name })}
                            className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                            <Reply className="w-3 h-3" /> Odpovedať
                          </button>
                        )}
                        <span className="text-xs text-muted-foreground">{new Date(comment.created_at).toLocaleDateString("sk")}</span>
                      </div>
                    </div>
                    <p className="text-sm text-foreground/80">{renderCommentText(comment.text)}</p>
                  </motion.div>
                ))}
                {comments.length === 0 && <p className="text-muted-foreground text-sm">Zatiaľ žiadne komentáre. Buďte prvý!</p>}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DogProfile;
