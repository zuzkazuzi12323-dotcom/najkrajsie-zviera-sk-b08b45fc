ALTER TABLE public.email_delivery_log
  ADD COLUMN IF NOT EXISTS amount_cents integer,
  ADD COLUMN IF NOT EXISTS item_name text;