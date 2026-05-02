
-- 1. Limit voting to 1 vote per account per 24 hours (across all dogs)
CREATE OR REPLACE FUNCTION public.enforce_vote_rate_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  last_vote_at timestamptz;
BEGIN
  SELECT MAX(created_at) INTO last_vote_at
  FROM public.votes
  WHERE user_id = NEW.user_id
    AND created_at > now() - interval '24 hours';

  IF last_vote_at IS NOT NULL THEN
    RAISE EXCEPTION 'Z jedného účtu môžete hlasovať iba raz za 24 hodín. Skúste to znova neskôr.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS votes_rate_limit ON public.votes;
CREATE TRIGGER votes_rate_limit
BEFORE INSERT ON public.votes
FOR EACH ROW
EXECUTE FUNCTION public.enforce_vote_rate_limit();

-- 2. Add winner flag for real contest winners
ALTER TABLE public.dogs ADD COLUMN IF NOT EXISTS is_winner boolean NOT NULL DEFAULT false;
ALTER TABLE public.dogs ADD COLUMN IF NOT EXISTS winner_place integer;
