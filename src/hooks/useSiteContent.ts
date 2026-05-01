import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SiteContentRow = {
  key: string;
  page: string;
  label: string;
  value: string;
  type: string;
  sort_order: number;
};

export const useSiteContent = () => {
  const { data } = useQuery({
    queryKey: ["site-content"],
    queryFn: async () => {
      const { data } = await supabase.from("site_content").select("*");
      const map: Record<string, string> = {};
      (data as SiteContentRow[] | null)?.forEach((row) => {
        map[row.key] = row.value;
      });
      return map;
    },
    staleTime: 60_000,
  });

  /** Get text by key, fall back to provided default if not configured yet. */
  const t = (key: string, fallback: string) => {
    const value = data?.[key];
    if (value === undefined || value === null || value === "") return fallback;
    return value;
  };

  return t;
};

/** Splits a textarea content by newlines into list items (used for bullet lists). */
export const splitLines = (text: string) =>
  text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
