-- =============================================
-- SPONSORS TABLE
-- =============================================
CREATE TABLE public.sponsors (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  logo_url text,
  banner_url text,
  link_url text,
  cta_label text DEFAULT 'Zistiť viac',
  placement text NOT NULL DEFAULT 'footer',
  package_tier text NOT NULL DEFAULT 'basic',
  featured boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.sponsors TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sponsors TO authenticated;
GRANT ALL ON public.sponsors TO service_role;

ALTER TABLE public.sponsors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active sponsors viewable by everyone"
ON public.sponsors FOR SELECT
USING (active = true OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage sponsors"
ON public.sponsors FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_sponsors_updated_at
BEFORE UPDATE ON public.sponsors
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- SPONSOR INQUIRIES (contact form)
-- =============================================
CREATE TABLE public.sponsor_inquiries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  handled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.sponsor_inquiries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sponsor_inquiries TO authenticated;
GRANT ALL ON public.sponsor_inquiries TO service_role;

ALTER TABLE public.sponsor_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an inquiry"
ON public.sponsor_inquiries FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins can manage inquiries"
ON public.sponsor_inquiries FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- =============================================
-- SECURITY FIX: blocked-user helper
-- =============================================
CREATE OR REPLACE FUNCTION public.is_blocked()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT blocked FROM public.profiles WHERE user_id = auth.uid()), false);
$$;

REVOKE EXECUTE ON FUNCTION public.is_blocked() FROM anon;

-- =============================================
-- SECURITY FIX: dogs INSERT cannot bypass payment / set privileged columns
-- =============================================
DROP POLICY IF EXISTS "Users can insert own dogs" ON public.dogs;
CREATE POLICY "Users can insert own dogs"
ON public.dogs FOR INSERT
WITH CHECK (
  auth.uid() = owner_id
  AND approved = false
  AND highlighted = false
  AND boost_votes = 0
  AND is_winner = false
  AND winner_place IS NULL
  AND archived = false
  AND NOT public.is_blocked()
);

-- =============================================
-- SECURITY FIX: blocked users cannot vote / comment
-- =============================================
DROP POLICY IF EXISTS "Auth users can vote" ON public.votes;
CREATE POLICY "Auth users can vote"
ON public.votes FOR INSERT
WITH CHECK (auth.uid() = user_id AND NOT public.is_blocked());

DROP POLICY IF EXISTS "Auth users can comment" ON public.comments;
CREATE POLICY "Auth users can comment"
ON public.comments FOR INSERT
WITH CHECK (auth.uid() = user_id AND NOT public.is_blocked());

-- =============================================
-- SECURITY FIX: donations counter not publicly callable
-- =============================================
REVOKE EXECUTE ON FUNCTION public.add_donation(integer) FROM anon, authenticated;

-- =============================================
-- SECURITY FIX: protect user emails from public exposure
-- =============================================
DROP POLICY IF EXISTS "Profiles viewable by everyone" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles"
ON public.profiles FOR SELECT
TO authenticated
USING (true);

-- Safe public view exposing only non-PII columns (no email)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT user_id, display_name, avatar_url
FROM public.profiles;

GRANT SELECT ON public.public_profiles TO anon, authenticated;