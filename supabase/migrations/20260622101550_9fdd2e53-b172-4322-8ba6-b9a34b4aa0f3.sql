ALTER TABLE public.shelters ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;
ALTER TABLE public.shelters ADD COLUMN IF NOT EXISTS show_iban boolean NOT NULL DEFAULT true;

CREATE POLICY "Admins can update donations total"
  ON public.donations_total FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));