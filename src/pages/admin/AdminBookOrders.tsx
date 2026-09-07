import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Download, ImageIcon, Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
import JSZip from "jszip";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type BookOrder = {
  id: string;
  dog_name: string;
  breed: string | null;
  age: string | null;
  story: string | null;
  ai_help: boolean;
  photos: string[];
  customer_name: string;
  address: string;
  street: string | null;
  city: string | null;
  zip: string | null;
  email: string;
  phone: string | null;
  amount: number;
  status: string;
  created_at: string;
};

const copy = (text: string, label: string) => {
  navigator.clipboard.writeText(text);
  toast.success(`${label} skopírované`);
};

const OrderPhotos = ({ paths }: { paths: string[] }) => {
  const { data: urls = [] } = useQuery({
    queryKey: ["book-photo-urls", paths],
    queryFn: async () => {
      const { data } = await supabase.storage.from("book-photos").createSignedUrls(paths, 3600);
      return (data || []).map((d) => d.signedUrl).filter(Boolean) as string[];
    },
    enabled: paths.length > 0,
  });

  if (paths.length === 0) return <p className="text-sm text-muted-foreground">Bez fotiek</p>;

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
      {urls.map((url, i) => (
        <a key={url} href={url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg border border-border">
          <img src={url} alt={`Fotka ${i + 1}`} loading="lazy" className="h-24 w-full object-cover" />
        </a>
      ))}
    </div>
  );
};

const AdminBookOrders = () => {
  const qc = useQueryClient();
  const [zipping, setZipping] = useState<string | null>(null);
  const [sending, setSending] = useState<string | null>(null);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-book-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("book_orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []) as BookOrder[];
    },
  });

  const downloadZip = async (order: BookOrder) => {
    setZipping(order.id);
    try {
      const zip = new JSZip();
      const { data: signed } = await supabase.storage.from("book-photos").createSignedUrls(order.photos, 3600);
      for (const [i, item] of (signed || []).entries()) {
        if (!item.signedUrl) continue;
        const blob = await (await fetch(item.signedUrl)).blob();
        const ext = order.photos[i].split(".").pop() || "jpg";
        zip.file(`${i + 1}.${ext}`, blob);
      }
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `kniha-${order.dog_name}-${order.id.slice(0, 8)}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      toast.error(e.message || "Stiahnutie zlyhalo");
    } finally {
      setZipping(null);
    }
  };

  const resendEmail = async (order: BookOrder) => {
    setSending(order.id);
    try {
      const { error } = await supabase.functions.invoke("send-book-confirmation", {
        body: { orderId: order.id },
      });
      if (error) throw error;
      toast.success("Potvrdenie odoslané");
    } catch (e: any) {
      toast.error(e.message || "E-mail sa nepodarilo odoslať");
    } finally {
      setSending(null);
    }
  };

  const setStatus = async (order: BookOrder, status: string) => {
    const { error } = await supabase.from("book_orders").update({ status }).eq("id", order.id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-book-orders"] });
  };

  const packetaLine = (o: BookOrder) =>
    [o.customer_name, o.street || o.address, o.city || "", o.zip || "", o.phone || "", o.email].join("\t");

  if (isLoading) return <p className="text-muted-foreground">Načítavam…</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Objednávky knihy</h1>
        <p className="text-sm text-muted-foreground">
          Celkom {orders.length} objednávok. Adresu môžete kopírovať po políčkach priamo do Packety.
        </p>
      </div>

      {orders.length === 0 && <p className="text-muted-foreground">Žiadne objednávky.</p>}

      <div className="space-y-4">
        {orders.map((o) => (
          <div key={o.id} className="rounded-2xl border border-border bg-card p-4 sm:p-5 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-bold text-foreground">
                  {o.dog_name} {o.breed ? `· ${o.breed}` : ""} {o.age ? `· ${o.age}` : ""}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {new Date(o.created_at).toLocaleString("sk")} · {(o.amount / 100).toFixed(2)} € ·{" "}
                  <span className={o.status === "paid" ? "text-green-600 font-semibold" : "font-semibold"}>{o.status}</span>
                  {o.ai_help && " · chce AI príbeh"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => copy(packetaLine(o), "Riadok pre Packetu")}>
                  <Copy className="mr-1.5 h-4 w-4" /> Kopírovať pre Packetu
                </Button>
                <Button size="sm" variant="outline" disabled={zipping === o.id} onClick={() => downloadZip(o)}>
                  {zipping === o.id ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Download className="mr-1.5 h-4 w-4" />}
                  Fotky ZIP
                </Button>
                <Button size="sm" variant="outline" disabled={sending === o.id} onClick={() => resendEmail(o)}>
                  {sending === o.id ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Mail className="mr-1.5 h-4 w-4" />}
                  Poslať potvrdenie
                </Button>
                <select
                  value={o.status}
                  onChange={(e) => setStatus(o, e.target.value)}
                  className="rounded-lg border border-border bg-background px-2 py-1 text-sm"
                >
                  <option value="pending">pending</option>
                  <option value="paid">paid</option>
                  <option value="in_production">in_production</option>
                  <option value="shipped">shipped</option>
                  <option value="canceled">canceled</option>
                </select>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { label: "Meno a priezvisko", value: o.customer_name },
                { label: "Ulica a číslo", value: o.street || o.address },
                { label: "Obec", value: o.city || "" },
                { label: "PSČ", value: o.zip || "" },
                { label: "Telefón", value: o.phone || "" },
                { label: "E-mail", value: o.email },
              ].map(({ label, value }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => value && copy(value, label)}
                  className="flex items-center justify-between gap-2 rounded-xl border border-border bg-background px-3 py-2 text-left hover:bg-secondary"
                >
                  <span>
                    <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">{label}</span>
                    <span className="text-sm font-medium text-foreground">{value || "—"}</span>
                  </span>
                  <Copy className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                </button>
              ))}
            </div>

            {o.story && (
              <div className="rounded-xl bg-secondary/50 p-3">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Príbeh</p>
                <p className="whitespace-pre-wrap text-sm text-foreground">{o.story}</p>
              </div>
            )}

            <div>
              <p className="mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                <ImageIcon className="h-3.5 w-3.5" /> Fotky ({o.photos?.length || 0})
              </p>
              <OrderPhotos paths={o.photos || []} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminBookOrders;
