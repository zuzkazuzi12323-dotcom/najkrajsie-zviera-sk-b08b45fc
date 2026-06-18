CREATE TABLE public.shelters (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  city text,
  description text,
  logo_url text,
  support_url text,
  active boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.shelters TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shelters TO authenticated;
GRANT ALL ON public.shelters TO service_role;

ALTER TABLE public.shelters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active shelters"
ON public.shelters FOR SELECT
USING (active = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert shelters"
ON public.shelters FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update shelters"
ON public.shelters FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete shelters"
ON public.shelters FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_shelters_updated_at
BEFORE UPDATE ON public.shelters
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();