ALTER TABLE public.platform_supporters
  ADD COLUMN IF NOT EXISTS is_main boolean NOT NULL DEFAULT false;

DROP VIEW IF EXISTS public.platform_supporters_public;

CREATE VIEW public.platform_supporters_public AS
  SELECT id,
         CASE WHEN is_anonymous THEN 'Anonym' ELSE COALESCE(NULLIF(name, ''), 'Anonym') END AS name,
         amount_cents,
         CASE WHEN show_comment THEN comment ELSE NULL END AS comment,
         is_main,
         created_at
  FROM public.platform_supporters
  WHERE status = 'completed' AND hidden = false
  ORDER BY is_main DESC, created_at DESC;

GRANT SELECT ON public.platform_supporters_public TO anon, authenticated;