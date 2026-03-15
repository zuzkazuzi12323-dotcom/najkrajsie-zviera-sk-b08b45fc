import { useParams, Link } from "react-router-dom";
import { Heart, ArrowLeft, MessageCircle, Calendar, Award, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { mockDogs, mockComments } from "@/data/mockDogs";
import { toast } from "sonner";

const DogProfile = () => {
  const { id } = useParams();
  const dog = mockDogs.find((d) => d.id === id);
  const comments = mockComments.filter((c) => c.dogId === id);

  const [votes, setVotes] = useState(dog?.votes || 0);
  const [voted, setVoted] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [localComments, setLocalComments] = useState(comments);

  if (!dog) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground mb-2">Pes nebol nájdený</p>
            <Link to="/galeria" className="text-primary font-medium">Späť na galériu</Link>
          </div>
        </div>
      </div>
    );
  }

  const handleVote = () => {
    if (!voted) {
      setVotes((v) => v + 1);
      setVoted(true);
      toast.success("Hlas započítaný! 🐾");
    } else {
      toast.info("Už si hlasoval za tohto psa");
    }
  };

  const handleComment = () => {
    if (!newComment.trim()) return;
    const comment = {
      id: `c-new-${Date.now()}`,
      dogId: dog.id,
      userId: "guest",
      userName: "Hosť",
      text: newComment.trim(),
      createdAt: new Date().toISOString().split("T")[0],
    };
    setLocalComments((prev) => [comment, ...prev]);
    setNewComment("");
    toast.success("Komentár pridaný!");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Link
          to="/galeria"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Späť na galériu
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <img
              src={dog.image}
              alt={dog.name}
              className="w-full aspect-[4/5] object-cover rounded-3xl shadow-elevated"
            />
            {dog.highlighted && (
              <div className="absolute top-4 left-4 flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-golden">
                <Award className="w-4 h-4" />
                Top Kandidát
              </div>
            )}
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-2">{dog.name}</h1>
            <p className="text-lg text-muted-foreground mb-6">{dog.breed} · {dog.age}</p>

            <p className="text-foreground/80 text-pretty mb-8 leading-relaxed">{dog.description}</p>

            <div className="flex items-center gap-4 mb-8">
              <motion.button
                onClick={handleVote}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg shadow-lg transition-colors ${
                  voted
                    ? "gradient-golden text-primary-foreground shadow-golden"
                    : "bg-card text-card-foreground border border-border hover:border-primary"
                }`}
              >
                <Heart className={`w-5 h-5 ${voted ? "fill-current" : ""}`} />
                Hlasovať
              </motion.button>
              <div className="text-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={votes}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-3xl font-bold tabular-nums text-foreground"
                  >
                    {votes}
                  </motion.p>
                </AnimatePresence>
                <p className="text-sm text-muted-foreground">hlasov</p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> Pridaný {dog.createdAt}
              </span>
              <span>Majiteľ: {dog.ownerName}</span>
            </div>

            {/* Comments */}
            <div>
              <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Komentáre ({localComments.length})
              </h3>

              {/* Add comment */}
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  placeholder="Napíšte komentár..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleComment()}
                  className="flex-1 px-4 py-3 rounded-xl bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                  maxLength={500}
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleComment}
                  className="px-4 py-3 rounded-xl gradient-golden text-primary-foreground"
                >
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Comments list */}
              <div className="space-y-3">
                {localComments.map((comment) => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-secondary/50 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-foreground">{comment.userName}</span>
                      <span className="text-xs text-muted-foreground">{comment.createdAt}</span>
                    </div>
                    <p className="text-sm text-foreground/80">{comment.text}</p>
                  </motion.div>
                ))}
                {localComments.length === 0 && (
                  <p className="text-muted-foreground text-sm">Zatiaľ žiadne komentáre. Buďte prvý!</p>
                )}
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
