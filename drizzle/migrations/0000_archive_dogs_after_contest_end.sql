CREATE OR REPLACE FUNCTION public.archive_dog_after_contest_end()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE s RECORD;
BEGIN
  SELECT active, end_date INTO s FROM public.contest_settings ORDER BY (end_date IS NULL), updated_at DESC LIMIT 1;
  IF s.end_date IS NOT NULL AND now() > s.end_date THEN
    NEW.archived := true;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS dogs_archive_after_end ON public.dogs;
CREATE TRIGGER dogs_archive_after_end BEFORE INSERT ON public.dogs
FOR EACH ROW EXECUTE FUNCTION public.archive_dog_after_contest_end();

UPDATE public.dogs d SET archived = true
WHERE d.archived = false AND d.is_winner = false AND EXISTS (
  SELECT 1 FROM public.contest_settings c
  WHERE c.end_date IS NOT NULL AND now() > c.end_date AND d.created_at > c.end_date
);