import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Sponsor = {
  id: string;
  title: string;
  description: string | null;
  logo_url: string | null;
  banner_url: string | null;
  banner_text: string | null;
  link_url: string | null;
  cta_label: string | null;
  placement: string | null;
  package_tier: string | null;
  featured: boolean;
  active: boolean;
  sort_order: number;
};

/** Fetches all active sponsors/partners ordered by sort order. */
export const useActiveSponsors = () => {
  return useQuery({
    queryKey: ["active-sponsors"],
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    queryFn: async () => {
      const { data } = await supabase
        .from("sponsors")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      return (data || []) as Sponsor[];
    },
  });
};
