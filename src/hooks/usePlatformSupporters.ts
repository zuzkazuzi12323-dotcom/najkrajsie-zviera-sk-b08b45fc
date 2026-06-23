import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type PublicSupporter = {
  id: string;
  name: string;
  amount_cents: number;
  comment: string | null;
  created_at: string;
};

/** Public, masked list of platform supporters (anonymous shown as "Anonym"). */
export const usePlatformSupporters = () =>
  useQuery({
    queryKey: ["platform-supporters-public"],
    queryFn: async () => {
      const { data } = await supabase
        .from("platform_supporters_public")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      return (data || []) as PublicSupporter[];
    },
  });
