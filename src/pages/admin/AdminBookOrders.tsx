import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Download, ImageIcon, Loader2, Mail, Trash2 } from "lucide-react";
import { toast } from "sonner";
import JSZip from "jszip";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "pending", label: "čaká sa na" },
  { value: "paid", label: "zaplatené" },
  { value: "in_production", label: "v produkcii" },
  { value: "shipped", label: "odoslané" },
  { value: "canceled", label: "zrušené" },
];

const statusColor = (status: string) => {
  switch (status) {
    case "paid":
    case "shipped":
      return "bg-green-100 text-green-700 hover:bg-green-100";
    case "in_production":
      return "bg-blue-100 text-blue-700 hover:bg-blue-100";
    case "canceled":
      return "bg-red-100 text-red-700 hover:bg-red-100";
    default:
      return "bg-amber-100 text-amber-700 hover:bg-amber-100";
  }
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
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
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
  const [selected, setSelected] = useState<BookOrder | null>(null);
  const [zipping, setZipping] = useState<string | null>(null);
  const [sending, setSending] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [tab, setTab] = useState<string>("all");

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

  const counts = STATUS_OPTIONS.reduce<Record<string, number>>((acc, s) => {
    acc[s.value] = orders.filter((o) => o.status === s.value).length;
    return acc;
  }, {});

  const filtered = tab === "all" ? orders : orders.filter((o) => o.status === tab);

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
      const { error } = await supabase.functions.invoke("send-book-status", {
        body: { orderId: order.id, status: order.status },
      });
      if (error) throw error;
      toast.success(`E-mail odoslaný (${statusLabel(order.status)})`);
    } catch (e: any) {
      toast.error(e.message || "E-mail sa nepodarilo odoslať");
    } finally {
      setSending(null);
    }
  };

  const setStatus = async (order: BookOrder, status: string) => {
    const { error } = await supabase.from("book_orders").update({ status }).eq("id", order.id);
    if (error) return toast.error(error.message);
    toast.success("Status uložený (bez e-mailu)");
    qc.invalidateQueries({ queryKey: ["admin-book-orders"] });
  };


  const deleteOrder = async (order: BookOrder) => {
    setDeleting(true);
    const { error } = await supabase.from("book_orders").delete().eq("id", order.id);
    setDeleting(false);
    setConfirmDelete(false);
    if (error) return toast.error(error.message);
    toast.success("Objednávka zmazaná");
    setSelected(null);
    qc.invalidateQueries({ queryKey: ["admin-book-orders"] });
  };

  const packetaLine = (o: BookOrder) =>
    [o.customer_name, o.street || o.address, o.city || "", o.zip || "", o.phone || "", o.email].join("\t");

  const statusLabel = (value: string) =>
    STATUS_OPTIONS.find((s) => s.value === value)?.label || value;

  if (isLoading) return <p className="text-muted-foreground">Načítavam…</p>;

  const tabs = [
    { value: "all", label: "Všetky", count: orders.length },
    ...STATUS_OPTIONS.map((s) => ({ value: s.value, label: s.label, count: counts[s.value] || 0 })),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Objednávky knihy</h1>
        <p className="text-sm text-muted-foreground">Celkom {orders.length} objednávok. Kliknutím otvoríš detail.</p>
      </div>

      <div className="-mx-1 flex flex-wrap gap-2 px-1">
        {tabs.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm",
              tab === t.value
                ? "border-transparent bg-[hsl(var(--book-orange))] text-white"
                : "border-border bg-background text-muted-foreground hover:bg-secondary",
            )}
          >
            {t.label} <span className="opacity-80">({t.count})</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground">Žiadne objednávky.</p>
      ) : (
        <>
          {/* Mobil: kompaktné riadky */}
          <div className="space-y-2 md:hidden">
            {filtered.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setSelected(o)}
                className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2.5 text-left"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-foreground">
                    {o.dog_name}
                    {o.breed ? ` · ${o.breed}` : ""}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {o.customer_name} · {new Date(o.created_at).toLocaleDateString("sk")} · {(o.amount / 100).toFixed(2)} €
                  </span>
                </span>
                <Badge className={cn("shrink-0 text-[10px]", statusColor(o.status))} variant="secondary">
                  {statusLabel(o.status)}
                </Badge>
              </button>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Meno psa</TableHead>
                  <TableHead>Plemeno</TableHead>
                  <TableHead>Dátum</TableHead>
                  <TableHead>Zákazník</TableHead>
                  <TableHead>Cena</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((o) => (
                  <TableRow key={o.id} className="cursor-pointer" onClick={() => setSelected(o)}>
                    <TableCell className="font-medium">{o.dog_name}</TableCell>
                    <TableCell>{o.breed || "—"}</TableCell>
                    <TableCell>{new Date(o.created_at).toLocaleString("sk")}</TableCell>
                    <TableCell>{o.customer_name}</TableCell>
                    <TableCell>{(o.amount / 100).toFixed(2)} €</TableCell>
                    <TableCell>
                      <Badge className={statusColor(o.status)} variant="secondary">
                        {statusLabel(o.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          {selected && (
            <>
              <SheetHeader className="pb-4 text-left">
                <SheetTitle className="text-lg sm:text-xl">
                  {selected.dog_name} {selected.breed ? `· ${selected.breed}` : ""} {selected.age ? `· ${selected.age}` : ""}
                </SheetTitle>
                <SheetDescription>
                  {new Date(selected.created_at).toLocaleString("sk")} · {(selected.amount / 100).toFixed(2)} €
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 pt-2">
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => copy(packetaLine(selected), "Riadok pre Packetu")}>
                    <Copy className="mr-1.5 h-4 w-4" /> Kopírovať pre Packetu
                  </Button>
                  <Button size="sm" variant="outline" disabled={zipping === selected.id} onClick={() => downloadZip(selected)}>
                    {zipping === selected.id ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Download className="mr-1.5 h-4 w-4" />}
                    Fotky ZIP
                  </Button>
                  <Button size="sm" variant="outline" disabled={sending === selected.id || selected.status === "pending" || selected.status === "canceled"} onClick={() => resendEmail(selected)}>
                    {sending === selected.id ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Mail className="mr-1.5 h-4 w-4" />}
                    Poslať potvrdenie
                  </Button>
                </div>

                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-background p-3">
                  <span className="text-sm text-muted-foreground">Zmeniť status:</span>
                  <select
                    value={selected.status}
                    onChange={(e) => {
                      const newStatus = e.target.value;
                      setStatus({ ...selected, status: newStatus }, newStatus);
                      setSelected({ ...selected, status: newStatus });
                    }}
                    className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { label: "Meno a priezvisko", value: selected.customer_name },
                    { label: "Ulica a číslo", value: selected.street || selected.address },
                    { label: "Obec", value: selected.city || "" },
                    { label: "PSČ", value: selected.zip || "" },
                    { label: "Telefón", value: selected.phone || "" },
                    { label: "E-mail", value: selected.email },
                  ].map(({ label, value }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => value && copy(value, label)}
                      className="flex items-center justify-between gap-2 rounded-xl border border-border bg-background px-3 py-2 text-left hover:bg-secondary"
                    >
                      <span className="min-w-0">
                        <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">{label}</span>
                        <span className="block truncate text-sm font-medium text-foreground">{value || "—"}</span>
                      </span>
                      <Copy className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    </button>
                  ))}
                </div>

                {selected.story && (
                  <div className="rounded-xl bg-secondary/50 p-3">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Príbeh</p>
                    <p className="whitespace-pre-wrap text-sm text-foreground">{selected.story}</p>
                  </div>
                )}

                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
                    <ImageIcon className="h-3.5 w-3.5" /> Fotky ({selected.photos?.length || 0})
                  </p>
                  <OrderPhotos paths={selected.photos || []} />
                </div>

                <div className="border-t border-border pt-4">
                  <Button
                    variant="destructive"
                    className="w-full sm:w-auto"
                    disabled={deleting}
                    onClick={() => setConfirmDelete(true)}
                  >
                    {deleting ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Trash2 className="mr-1.5 h-4 w-4" />}
                    Zmazať objednávku
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Zmazať objednávku?</AlertDialogTitle>
            <AlertDialogDescription>
              Naozaj zmazať objednávku {selected?.dog_name} – {selected?.customer_name}? Táto akcia sa nedá vrátiť.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Zrušiť</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={(e) => {
                e.preventDefault();
                if (selected) deleteOrder(selected);
              }}
            >
              Zmazať
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminBookOrders;
