import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type TransparencyCategory = "shelter" | "sponsor" | "user_gift";

export type TransparencyRecord = {
  id: string;
  category: TransparencyCategory;
  title: string;
  description: string | null;
  shelter_name: string | null;
  donor_name: string | null;
  amount_cents: number | null;
  image_url: string | null;
  record_date: string;
  published: boolean;
  display_order: number;
  created_at: string;
};

/** Public transparency records (only published ones are returned for visitors). */
export const useTransparencyRecords = () =>
  useQuery({
    queryKey: ["transparency-records"],
    queryFn: async () => {
      const { data } = await supabase
        .from("transparency_records")
        .select("*")
        .eq("published", true)
        .order("record_date", { ascending: false })
        .order("created_at", { ascending: false });
      return (data || []) as TransparencyRecord[];
    },
  });
