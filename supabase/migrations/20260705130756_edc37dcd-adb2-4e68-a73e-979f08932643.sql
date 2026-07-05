-- Per-shelter collected amount
ALTER TABLE public.shelters ADD COLUMN IF NOT EXISTS collected_cents integer NOT NULL DEFAULT 0;

-- Recreate public view to include collected_cents
DROP VIEW IF EXISTS public.shelters_public;
CREATE VIEW public.shelters_public AS
 SELECT id,
    name,
    city,
    description,
    logo_url,
    support_url,
    active,
    display_order,
    featured,
    show_iban,
    CASE WHEN show_iban THEN iban ELSE NULL::text END AS iban,
    CASE WHEN show_iban THEN bank_holder ELSE NULL::text END AS bank_holder,
    collected_cents,
    created_at,
    updated_at
   FROM public.shelters
  WHERE active = true;

GRANT SELECT ON public.shelters_public TO anon, authenticated;

-- Shelter application status enum
DO $$ BEGIN
  CREATE TYPE public.shelter_application_status AS ENUM ('pending', 'needs_info', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Applications submitted publicly by shelters
CREATE TABLE IF NOT EXISTS public.shelter_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text,
  description text,
  logo_url text,
  support_url text,
  iban text,
  bank_holder text,
  contact_name text,
  contact_email text NOT NULL,
  contact_phone text,
  status public.shelter_application_status NOT NULL DEFAULT 'pending',
  admin_note text,
  agreed_terms boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.shelter_applications TO authenticated;
GRANT INSERT ON public.shelter_applications TO anon;
GRANT ALL ON public.shelter_applications TO service_role;

ALTER TABLE public.shelter_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a shelter application"
  ON public.shelter_applications FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'pending' AND agreed_terms = true);

CREATE POLICY "Admins can view shelter applications"
  ON public.shelter_applications FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update shelter applications"
  ON public.shelter_applications FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete shelter applications"
  ON public.shelter_applications FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_shelter_applications_updated_at
  BEFORE UPDATE ON public.shelter_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.notify_new_shelter_application()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.admin_notifications (type, message, reference_id)
  VALUES ('new_shelter_application', 'Nová žiadosť útulku: ' || NEW.name, NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER notify_new_shelter_application
  AFTER INSERT ON public.shelter_applications
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_shelter_application();