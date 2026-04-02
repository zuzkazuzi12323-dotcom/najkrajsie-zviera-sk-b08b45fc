import { useState } from "react";
import { Ban, Search } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AdminUsers = () => {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  const filtered = users.filter(
    (u) => (u.display_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const toggleBlock = async (userId: string, currentlyBlocked: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({ blocked: !currentlyBlocked })
      .eq("user_id", userId);
    if (error) {
      toast.error("Nepodarilo sa zmeniť stav");
    } else {
      toast.success(currentlyBlocked ? "Používateľ odblokovaný" : "Používateľ zablokovaný");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Hľadať používateľa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary text-sm"
        />
      </div>

      <div className="bg-card rounded-2xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Meno</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">E-mail</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Registrácia</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Stav</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Akcie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((user) => (
                <tr key={user.id} className="group hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-foreground">{user.display_name || "Bez mena"}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString("sk")}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      !user.blocked ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {user.blocked ? "Blokovaný" : "Aktívny"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => toggleBlock(user.user_id, user.blocked)}
                      className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                      title={user.blocked ? "Odblokovať" : "Blokovať"}
                    >
                      <Ban className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
