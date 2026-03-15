import { useState } from "react";
import { Trash2 } from "lucide-react";
import { mockComments, mockDogs } from "@/data/mockDogs";
import { toast } from "sonner";

const AdminComments = () => {
  const [comments, setComments] = useState(mockComments);

  const deleteComment = (id: string) => {
    setComments((prev) => prev.filter((c) => c.id !== id));
    toast.success("Komentár bol vymazaný");
  };

  const getDogName = (dogId: string) => mockDogs.find((d) => d.id === dogId)?.name || "Neznámy";

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Autor</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Pes</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Komentár</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Dátum</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Akcie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {comments.map((comment) => (
                <tr key={comment.id} className="group hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-foreground">{comment.userName}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{getDogName(comment.dogId)}</td>
                  <td className="px-5 py-3 text-sm text-foreground max-w-xs truncate">{comment.text}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{comment.createdAt}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => deleteComment(comment.id)}
                      className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Vymazať"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {comments.length === 0 && (
          <p className="text-center py-10 text-muted-foreground">Žiadne komentáre</p>
        )}
      </div>
    </div>
  );
};

export default AdminComments;
