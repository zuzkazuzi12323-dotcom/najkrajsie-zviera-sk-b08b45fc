
ALTER TABLE public.dogs ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.block_vote_on_archived_dog()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.dogs WHERE id = NEW.dog_id AND archived = true) THEN
    RAISE EXCEPTION 'Tento pes už súťažil v predchádzajúcom kole a nemôže prijímať hlasy.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS votes_block_archived ON public.votes;
CREATE TRIGGER votes_block_archived
  BEFORE INSERT ON public.votes
  FOR EACH ROW EXECUTE FUNCTION public.block_vote_on_archived_dog();
