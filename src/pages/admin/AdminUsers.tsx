import { useState } from "react";
import { Ban, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

const initialUsers = [
  { id: "u1", name: "Mária K.", email: "maria@email.sk", dogs: 1, status: "active" as const, date: "2025-03-01" },
  { id: "u2", name: "Peter N.", email: "peter@email.sk", dogs: 1, status: "active" as const, date: "2025-03-05" },
  { id: "u3", name: "Jana S.", email: "jana@email.sk", dogs: 1, status: "blocked" as const, date: "2025-02-20" },
  { id: "u4", name: "Tomáš B.", email: "tomas@email.sk", dogs: 1, status: "active" as const, date: "2025-03-10" },
  { id: "u5", name: "Lucia M.", email: "lucia@email.sk", dogs: 1, status: "active" as const, date: "2025-02-28" },
  { id: "u6", name: "Martin D.", email: "martin@email.sk", dogs: 1, status: "active" as const, date: "2025-03-08" },
];

const AdminUsers = () => {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");

  const filtered = users.filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleBlock = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === "active" ? ("blocked" as const) : ("active" as const) } : u
      )
    );
    toast.success("Stav používateľa bol zmenený");
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    toast.success("Používateľ bol vymazaný");
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
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Email</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Psy</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Stav</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-muted-foreground uppercase">Akcie</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((user) => (
                <tr key={user.id} className="group hover:bg-secondary/30 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-foreground">{user.name}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{user.email}</td>
                  <td className="px-5 py-3 text-sm tabular-nums text-foreground">{user.dogs}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                      user.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {user.status === "active" ? "Aktívny" : "Blokovaný"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => toggleBlock(user.id)}
                        className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground"
                        title={user.status === "active" ? "Blokovať" : "Odblokovať"}
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
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
      </div>
    </div>
  );
};

export default AdminUsers;
