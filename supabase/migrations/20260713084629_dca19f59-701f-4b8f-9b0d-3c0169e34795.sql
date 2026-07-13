-- Partner referral system for shelters

-- 1. Extend shelters with partner fields
ALTER TABLE public.shelters
  ADD COLUMN IF NOT EXISTS referral_code text,
  ADD COLUMN IF NOT EXISTS user_id uuid,
  ADD COLUMN IF NOT EXISTS contact_email text,
  ADD COLUMN IF NOT EXISTS referral_visits integer NOT NULL DEFAULT 0;

-- Backfill referral codes for existing shelters
UPDATE public.shelters
  SET referral_code = 'utulok-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8)
  WHERE referral_code IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'shelters_referral_code_unique'
  ) THEN
    ALTER TABLE public.shelters ADD CONSTRAINT shelters_referral_code_unique UNIQUE (referral_code);
  END IF;
END $$;

-- Auto-generate referral code on insert
CREATE OR REPLACE FUNCTION public.set_shelter_referral_code()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
    NEW.referral_code := 'utulok-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 8);
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_set_shelter_referral_code ON public.shelters;
CREATE TRIGGER trg_set_shelter_referral_code
  BEFORE INSERT ON public.shelters
  FOR EACH ROW EXECUTE FUNCTION public.set_shelter_referral_code();

-- Allow an approved shelter's own account to read its row (incl. referral code)
DROP POLICY IF EXISTS "Shelters can view own row" ON public.shelters;
CREATE POLICY "Shelters can view own row" ON public.shelters
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- 2. Referral registrations tracking
CREATE TABLE IF NOT EXISTS public.shelter_referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shelter_id uuid NOT NULL REFERENCES public.shelters(id) ON DELETE CASCADE,
  dog_id uuid,
  registrant_id uuid,
  amount_cents integer NOT NULL DEFAULT 0,
  reward_cents integer NOT NULL DEFAULT 0,
  is_paid boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shelter_referrals TO authenticated;
GRANT ALL ON public.shelter_referrals TO service_role;
ALTER TABLE public.shelter_referrals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage referrals" ON public.shelter_referrals;
CREATE POLICY "Admins manage referrals" ON public.shelter_referrals
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Shelters view own referrals" ON public.shelter_referrals;
CREATE POLICY "Shelters view own referrals" ON public.shelter_referrals
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.shelters s WHERE s.id = shelter_id AND s.user_id = auth.uid()));

-- 3. Payout history
CREATE TABLE IF NOT EXISTS public.shelter_payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shelter_id uuid NOT NULL REFERENCES public.shelters(id) ON DELETE CASCADE,
  amount_cents integer NOT NULL,
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shelter_payouts TO authenticated;
GRANT ALL ON public.shelter_payouts TO service_role;
ALTER TABLE public.shelter_payouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage payouts" ON public.shelter_payouts;
CREATE POLICY "Admins manage payouts" ON public.shelter_payouts
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Shelters view own payouts" ON public.shelter_payouts;
CREATE POLICY "Shelters view own payouts" ON public.shelter_payouts
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.shelters s WHERE s.id = shelter_id AND s.user_id = auth.uid()));

-- 4. RPC: public visit tracking
CREATE OR REPLACE FUNCTION public.track_shelter_visit(_code text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.shelters SET referral_visits = referral_visits + 1
  WHERE referral_code = _code AND active = true;
END; $$;
GRANT EXECUTE ON FUNCTION public.track_shelter_visit(text) TO anon, authenticated;

-- 5. RPC: record a registration referral (free-registration flow)
CREATE OR REPLACE FUNCTION public.record_shelter_referral(_code text, _dog_id uuid, _amount integer, _is_paid boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE s_id uuid;
BEGIN
  SELECT id INTO s_id FROM public.shelters WHERE referral_code = _code;
  IF s_id IS NULL THEN RETURN; END IF;
  IF EXISTS (SELECT 1 FROM public.shelter_referrals WHERE dog_id = _dog_id) THEN RETURN; END IF;
  INSERT INTO public.shelter_referrals (shelter_id, dog_id, registrant_id, amount_cents, reward_cents, is_paid)
  VALUES (
    s_id, _dog_id, auth.uid(), COALESCE(_amount, 0),
    CASE WHEN _is_paid THEN (COALESCE(_amount, 0) * 20 / 100) ELSE 0 END,
    COALESCE(_is_paid, false)
  );
END; $$;
GRANT EXECUTE ON FUNCTION public.record_shelter_referral(text, uuid, integer, boolean) TO authenticated;

-- 6. RPC: link shelter to logged-in user by matching email
CREATE OR REPLACE FUNCTION public.claim_shelter_for_user()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE u_email text;
BEGIN
  SELECT email INTO u_email FROM public.profiles WHERE user_id = auth.uid();
  IF u_email IS NULL THEN RETURN; END IF;
  UPDATE public.shelters SET user_id = auth.uid()
  WHERE user_id IS NULL AND lower(contact_email) = lower(u_email);
END; $$;
GRANT EXECUTE ON FUNCTION public.claim_shelter_for_user() TO authenticated;

-- updated_at trigger already exists globally; ensure tables have created_at only (no updates needed)