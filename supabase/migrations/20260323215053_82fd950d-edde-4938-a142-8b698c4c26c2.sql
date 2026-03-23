
CREATE TABLE public.donations_total (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_cents integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Insert single row
INSERT INTO public.donations_total (id, total_cents) VALUES ('00000000-0000-0000-0000-000000000001', 0);

-- Enable RLS
ALTER TABLE public.donations_total ENABLE ROW LEVEL SECURITY;

-- Everyone can read
CREATE POLICY "Anyone can read donations total" ON public.donations_total FOR SELECT USING (true);

-- Only service role can update (no user policy for insert/update/delete)

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.donations_total;

-- Function to add donation amount (called from webhook)
CREATE OR REPLACE FUNCTION public.add_donation(payment_amount integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.donations_total
  SET total_cents = total_cents + (payment_amount * 20 / 100),
      updated_at = now()
  WHERE id = '00000000-0000-0000-0000-000000000001';
END;
$$;
