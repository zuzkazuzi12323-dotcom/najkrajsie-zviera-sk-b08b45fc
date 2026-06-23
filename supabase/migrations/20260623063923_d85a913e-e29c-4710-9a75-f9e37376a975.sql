
-- ========== SHELTERS: hide bank details from public ==========
DROP POLICY IF EXISTS "Anyone can view active shelters" ON public.shelters;
CREATE POLICY "Admins can view all shelters" ON public.shelters FOR SELECT
  TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE VIEW public.shelters_public AS
  SELECT id, name, city, description, logo_url, support_url, active, display_order,
         featured, show_iban,
         CASE WHEN show_iban THEN iban ELSE NULL END AS iban,
         CASE WHEN show_iban THEN bank_holder ELSE NULL END AS bank_holder,
         created_at, updated_at
  FROM public.shelters
  WHERE active = true;
GRANT SELECT ON public.shelters_public TO anon, authenticated;

-- ========== PROFILES: hide emails from public ==========
DROP POLICY IF EXISTS "Profiles viewable by everyone" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE VIEW public.profiles_public AS
  SELECT user_id, display_name, avatar_url FROM public.profiles;
GRANT SELECT ON public.profiles_public TO anon, authenticated;

-- ========== DOGS: lock privileged fields on update for non-admins ==========
CREATE OR REPLACE FUNCTION public.prevent_dog_privileged_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;
  NEW.approved := OLD.approved;
  NEW.highlighted := OLD.highlighted;
  NEW.boost_votes := OLD.boost_votes;
  NEW.is_winner := OLD.is_winner;
  NEW.winner_place := OLD.winner_place;
  NEW.archived := OLD.archived;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS dogs_lock_privileged ON public.dogs;
CREATE TRIGGER dogs_lock_privileged BEFORE UPDATE ON public.dogs
  FOR EACH ROW EXECUTE FUNCTION public.prevent_dog_privileged_update();

-- ========== add_donation: restrict to service role only ==========
REVOKE EXECUTE ON FUNCTION public.add_donation(integer) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.add_donation(integer) TO service_role;

-- ========== NEW TABLE: platform_supporters ==========
CREATE TABLE public.platform_supporters (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text,
  is_anonymous boolean NOT NULL DEFAULT false,
  comment text,
  show_comment boolean NOT NULL DEFAULT false,
  amount_cents integer NOT NULL,
  status text NOT NULL DEFAULT 'completed',
  hidden boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.platform_supporters TO authenticated;
GRANT ALL ON public.platform_supporters TO service_role;
ALTER TABLE public.platform_supporters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage supporters" ON public.platform_supporters FOR ALL
  TO authenticated USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER update_platform_supporters_updated_at BEFORE UPDATE ON public.platform_supporters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE VIEW public.platform_supporters_public AS
  SELECT id,
         CASE WHEN is_anonymous THEN 'Anonym' ELSE COALESCE(NULLIF(name, ''), 'Anonym') END AS name,
         amount_cents,
         CASE WHEN show_comment THEN comment ELSE NULL END AS comment,
         created_at
  FROM public.platform_supporters
  WHERE status = 'completed' AND hidden = false
  ORDER BY created_at DESC;
GRANT SELECT ON public.platform_supporters_public TO anon, authenticated;

-- ========== NEW TABLE: transparency_records ==========
CREATE TABLE public.transparency_records (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category text NOT NULL,
  title text NOT NULL,
  description text,
  shelter_name text,
  donor_name text,
  amount_cents integer,
  image_url text,
  record_date date NOT NULL DEFAULT (now())::date,
  published boolean NOT NULL DEFAULT false,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT transparency_category_check CHECK (category IN ('shelter','sponsor','user_gift'))
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transparency_records TO authenticated;
GRANT ALL ON public.transparency_records TO service_role;
GRANT SELECT ON public.transparency_records TO anon;
ALTER TABLE public.transparency_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view published records" ON public.transparency_records FOR SELECT
  USING (published = true OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins manage transparency records" ON public.transparency_records FOR ALL
  TO authenticated USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER update_transparency_records_updated_at BEFORE UPDATE ON public.transparency_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
