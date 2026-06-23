import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Shelter = {
  id: string;
  name: string;
  city: string | null;
  description: string | null;
  logo_url: string | null;
  support_url: string | null;
  iban: string | null;
  bank_holder: string | null;
  active: boolean;
  featured: boolean;
  show_iban: boolean;
  display_order: number;
};

/** Active shelters, ordered by display_order, for public display. */
export const useActiveShelters = () =>
  useQuery({
    queryKey: ["active-shelters"],
    queryFn: async () => {
      const { data } = await supabase
        .from("shelters_public")
        .select("*")
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: true });
      return (data || []) as Shelter[];
    },
  });

/** The single currently supported (featured) shelter, if set. */
export const useFeaturedShelter = () =>
  useQuery({
    queryKey: ["featured-shelter"],
    queryFn: async () => {
      const { data } = await supabase
        .from("shelters_public")
        .select("*")
        .eq("featured", true)
        .order("display_order", { ascending: true })
        .limit(1)
        .maybeSingle();
      return (data as Shelter) || null;
    },
  });

/** Total amount collected for shelters (in cents). */
export const useDonationTotal = () =>
  useQuery({
    queryKey: ["donation-total"],
    queryFn: async () => {
      const { data } = await supabase
        .from("donations_total")
        .select("total_cents")
        .eq("id", "00000000-0000-0000-0000-000000000001")
        .single();
      return data?.total_cents || 0;
    },
  });
