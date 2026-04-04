import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useContestActive = () => {
  const { data } = useQuery({
    queryKey: ["contest-settings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("contest_settings")
        .select("active, end_date")
        .eq("id", "00000000-0000-0000-0000-000000000002")
        .single();
      return data;
    },
  });

  if (!data) return true; // default active while loading
  if (!data.active) return false;
  if (data.end_date && new Date(data.end_date).getTime() < Date.now()) return false;
  return true;
};
