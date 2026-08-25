CREATE TABLE public.affiliates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  clicks integer NOT NULL DEFAULT 0,
  reward_cents integer NOT NULL DEFAULT 60,
  paid boolean NOT NULL DEFAULT false,
  paid_at timestamptz,
  note text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.affiliates TO authenticated;
GRANT ALL ON public.affiliates TO service_role;

ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage affiliates" ON public.affiliates
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_affiliates_updated_at
  BEFORE UPDATE ON public.affiliates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.dogs ADD COLUMN IF NOT EXISTS ref_code text;
CREATE INDEX IF NOT EXISTS dogs_ref_code_idx ON public.dogs (ref_code);

CREATE OR REPLACE FUNCTION public.track_affiliate_click(_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.affiliates SET clicks = clicks + 1
  WHERE lower(code) = lower(_code) AND active = true;
END;
$$;

CREATE OR REPLACE FUNCTION public.affiliate_stats(_code text)
RETURNS TABLE (
  name text,
  code text,
  clicks integer,
  registrations integer,
  earnings_cents integer,
  paid boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.name,
         a.code,
         a.clicks,
         (SELECT COUNT(*)::int FROM public.dogs d WHERE lower(d.ref_code) = lower(a.code)),
         (SELECT COUNT(*)::int FROM public.dogs d WHERE lower(d.ref_code) = lower(a.code)) * a.reward_cents,
         a.paid
  FROM public.affiliates a
  WHERE lower(a.code) = lower(_code) AND a.active = true;
$$;

GRANT EXECUTE ON FUNCTION public.track_affiliate_click(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.affiliate_stats(text) TO anon, authenticated;