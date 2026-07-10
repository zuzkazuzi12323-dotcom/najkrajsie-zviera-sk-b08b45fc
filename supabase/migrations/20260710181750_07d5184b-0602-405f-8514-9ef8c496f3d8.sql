ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS payer_email text,
  ADD COLUMN IF NOT EXISTS confirmation_email_sent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS confirmation_email_at timestamptz,
  ADD COLUMN IF NOT EXISTS confirmation_email_error text;

CREATE TABLE IF NOT EXISTS public.email_delivery_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid NULL REFERENCES public.payments(id) ON DELETE SET NULL,
  stripe_session_id text,
  recipient_email text NOT NULL,
  template_name text NOT NULL,
  payment_type text NOT NULL,
  variable_symbol text,
  status text NOT NULL DEFAULT 'pending',
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_delivery_log TO authenticated;
GRANT ALL ON public.email_delivery_log TO service_role;

ALTER TABLE public.email_delivery_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage email delivery log" ON public.email_delivery_log;
CREATE POLICY "Admins can manage email delivery log"
ON public.email_delivery_log
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

DROP TRIGGER IF EXISTS update_email_delivery_log_updated_at ON public.email_delivery_log;
CREATE TRIGGER update_email_delivery_log_updated_at
BEFORE UPDATE ON public.email_delivery_log
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_email_delivery_log_payment_id ON public.email_delivery_log(payment_id);
CREATE INDEX IF NOT EXISTS idx_email_delivery_log_created_at ON public.email_delivery_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_delivery_log_status ON public.email_delivery_log(status);