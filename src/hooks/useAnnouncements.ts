import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Announcement = {
  id: string;
  title: string;
  message: string;
  variant: string;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export const useActiveAnnouncements = () => {
  return useQuery({
    queryKey: ["active-announcements"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_announcements")
        .select("*")
        .eq("active", true)
        .order("created_at", { ascending: false });
      return (data || []) as unknown as Announcement[];
    },
    staleTime: 60_000,
  });
};
