import { Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminComments = () => {
  const queryClient = useQueryClient();

  const { data: comments = [] } = useQuery({
    queryKey: ["admin-comments"],
    queryFn: async () => {
      const { data } = await supabase
        .from("comments")
        .select("*, profiles!comments_user_id_fkey(display_name), dogs!comments_dog_id_fkey(name)")
        .order("created_at", { ascending: false });
      return data?.map((c) => ({
        ...c,
        user_name: (c.profiles as any)?.display_name || "Neznámy",
        dog_name: (c.dogs as any)?.name || "Neznámy",
      })) || [];
    },
  });

  const deleteComment = async (id: string) => {
    const { error } = await supabase.from("comments").delete().eq("id", id);
    if (error) {
      toast.error("Nepodarilo sa vymazať komentár");
    } else {
      toast.success("Komentár bol vymazaný");
      queryClient.invalidateQueries({ queryKey: ["admin-comments"] });
    }
  };

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
                  <td className="px-5 py-3 text-sm font-medium text-foreground">{comment.user_name}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{comment.dog_name}</td>
                  <td className="px-5 py-3 text-sm text-foreground max-w-xs truncate">{comment.text}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">
                    {new Date(comment.created_at).toLocaleDateString("sk")}
                  </td>
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
