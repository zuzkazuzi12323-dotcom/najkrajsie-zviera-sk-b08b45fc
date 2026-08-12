CREATE OR REPLACE FUNCTION public.prevent_dog_privileged_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF current_user IN ('postgres', 'supabase_admin', 'service_role') THEN
    RETURN NEW;
  END IF;
  IF auth.uid() IS NOT NULL AND has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;
  NEW.approved := OLD.approved;
  NEW.highlighted := OLD.highlighted;
  NEW.boost_votes := OLD.boost_votes;
  NEW.is_winner := OLD.is_winner;
  NEW.winner_place := OLD.winner_place;
  NEW.archived := OLD.archived;
  RETURN NEW;
END;
$function$;