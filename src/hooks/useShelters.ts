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
  collected_cents: number;
  goal_cents: number;
  support_start_date: string | null;
  support_end_date: string | null;
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

/** A single shelter by id (public). */
export const useShelter = (id: string | undefined) =>
  useQuery({
    queryKey: ["shelter", id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await supabase
        .from("shelters_public")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      return (data as Shelter) || null;
    },
  });

export type ShelterHistoryEntry = {
  id: string;
  shelter_id: string;
  period_start: string;
  period_end: string;
  collected_cents: number;
  created_at: string;
  shelter?: Shelter | null;
};

/** History of shelter support periods, newest first, joined with shelter info. */
export const useShelterHistory = () =>
  useQuery({
    queryKey: ["shelter-history"],
    queryFn: async () => {
      const { data } = await supabase
        .from("shelter_support_history")
        .select("*")
        .order("period_end", { ascending: false });
      const entries = (data || []) as ShelterHistoryEntry[];
      const ids = [...new Set(entries.map((e) => e.shelter_id))];
      if (ids.length) {
        const { data: shelters } = await supabase
          .from("shelters_public")
          .select("*")
          .in("id", ids);
        const map = new Map((shelters || []).map((s: any) => [s.id, s as Shelter]));
        entries.forEach((e) => { e.shelter = map.get(e.shelter_id) || null; });
      }
      return entries;
    },
  });

/** Whether the "shelters we support" section is shown on the homepage. */
export const useSheltersVisible = () =>
  useQuery({
    queryKey: ["shelters-visible"],
    queryFn: async () => {
      const { data } = await supabase
        .from("contest_settings")
        .select("shelters_visible")
        .eq("id", "00000000-0000-0000-0000-000000000002")
        .maybeSingle();
      return (data as any)?.shelters_visible ?? true;
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
