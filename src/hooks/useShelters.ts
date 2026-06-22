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
  display_order: number;
};

/** Active shelters, ordered by display_order, for public display. */
export const useActiveShelters = () =>
  useQuery({
    queryKey: ["active-shelters"],
    queryFn: async () => {
      const { data } = await supabase
        .from("shelters")
        .select("*")
        .eq("active", true)
        .order("display_order", { ascending: true })
        .order("created_at", { ascending: true });
      return (data || []) as Shelter[];
    },
  });
