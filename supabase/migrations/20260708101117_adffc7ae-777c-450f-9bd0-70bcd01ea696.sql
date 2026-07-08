-- New fields for shelters: goal, support window
ALTER TABLE public.shelters
  ADD COLUMN IF NOT EXISTS goal_cents integer NOT NULL DEFAULT 50000,
  ADD COLUMN IF NOT EXISTS support_start_date timestamptz,
  ADD COLUMN IF NOT EXISTS support_end_date timestamptz;

-- Rotation settings on contest_settings
ALTER TABLE public.contest_settings
  ADD COLUMN IF NOT EXISTS shelters_auto_rotate boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS shelter_support_days integer NOT NULL DEFAULT 7;

-- History of support periods
CREATE TABLE IF NOT EXISTS public.shelter_support_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shelter_id uuid NOT NULL REFERENCES public.shelters(id) ON DELETE CASCADE,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  collected_cents integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.shelter_support_history TO anon, authenticated;
GRANT ALL ON public.shelter_support_history TO service_role;

ALTER TABLE public.shelter_support_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "History is publicly viewable"
  ON public.shelter_support_history FOR SELECT
  USING (true);

CREATE POLICY "Admins manage history"
  ON public.shelter_support_history FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Recreate public view with new columns
DROP VIEW IF EXISTS public.shelters_public;
CREATE VIEW public.shelters_public
WITH (security_invoker = true) AS
SELECT id, name, city, description, logo_url, support_url, active, display_order,
  featured, show_iban,
  CASE WHEN show_iban THEN iban ELSE NULL::text END AS iban,
  CASE WHEN show_iban THEN bank_holder ELSE NULL::text END AS bank_holder,
  collected_cents, goal_cents, support_start_date, support_end_date,
  created_at, updated_at
FROM public.shelters
WHERE active = true;

GRANT SELECT ON public.shelters_public TO anon, authenticated;

-- Rotation function: advances the featured shelter based on support window
CREATE OR REPLACE FUNCTION public.rotate_featured_shelter()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  s_days integer;
  auto boolean;
  cur RECORD;
  nxt RECORD;
BEGIN
  SELECT shelter_support_days, shelters_auto_rotate
    INTO s_days, auto
  FROM public.contest_settings
  WHERE id = '00000000-0000-0000-0000-000000000002';

  s_days := COALESCE(s_days, 7);
  IF NOT COALESCE(auto, true) THEN
    RETURN;
  END IF;

  SELECT * INTO cur FROM public.shelters
  WHERE featured = true AND active = true
  ORDER BY display_order ASC LIMIT 1;

  -- No featured yet: pick the first active shelter
  IF cur.id IS NULL THEN
    SELECT * INTO nxt FROM public.shelters
    WHERE active = true ORDER BY display_order ASC, created_at ASC LIMIT 1;
    IF nxt.id IS NOT NULL THEN
      UPDATE public.shelters SET featured = false WHERE featured = true;
      UPDATE public.shelters
        SET featured = true, support_start_date = now(),
            support_end_date = now() + (s_days || ' days')::interval
      WHERE id = nxt.id;
      INSERT INTO public.admin_notifications (type, message, reference_id)
        VALUES ('shelter_rotation', '🐾 Aktuálne podporujeme útulok: ' || nxt.name, nxt.id);
    END IF;
    RETURN;
  END IF;

  -- Current window still active
  IF cur.support_end_date IS NOT NULL AND now() < cur.support_end_date THEN
    RETURN;
  END IF;

  -- Record history for the finished period
  INSERT INTO public.shelter_support_history (shelter_id, period_start, period_end, collected_cents)
  VALUES (cur.id, COALESCE(cur.support_start_date, cur.created_at),
          COALESCE(cur.support_end_date, now()), cur.collected_cents);

  -- Find next active shelter by display_order, wrapping around
  SELECT * INTO nxt FROM public.shelters
  WHERE active = true AND display_order > cur.display_order
  ORDER BY display_order ASC, created_at ASC LIMIT 1;

  IF nxt.id IS NULL THEN
    SELECT * INTO nxt FROM public.shelters
    WHERE active = true ORDER BY display_order ASC, created_at ASC LIMIT 1;
  END IF;

  IF nxt.id IS NOT NULL THEN
    UPDATE public.shelters SET featured = false WHERE featured = true;
    UPDATE public.shelters
      SET featured = true, support_start_date = now(),
          support_end_date = now() + (s_days || ' days')::interval
    WHERE id = nxt.id;

    IF nxt.id <> cur.id THEN
      INSERT INTO public.admin_notifications (type, message, reference_id)
        VALUES ('shelter_rotation', '🐾 Tento týždeň podporujeme útulok: ' || nxt.name, nxt.id);
      INSERT INTO public.site_announcements (title, message, variant, active)
        VALUES ('Aktuálne podporovaný útulok',
                '🐾 Tento týždeň podporujeme ' || nxt.name || '. Pomôžte zvieratkám priamym príspevkom na účet útulku.',
                'info', true);
    END IF;
  END IF;
END;
$$;