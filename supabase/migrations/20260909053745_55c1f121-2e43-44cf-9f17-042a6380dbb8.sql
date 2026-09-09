CREATE OR REPLACE FUNCTION public.affiliate_stats(_code text)
 RETURNS TABLE(name text, code text, clicks integer, registrations integer, earnings_cents integer, paid boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT a.name,
         a.code,
         a.clicks,
         (SELECT COUNT(DISTINCT d.id)::int
            FROM public.dogs d
            JOIN public.payments p ON p.dog_id = d.id
           WHERE lower(d.ref_code) = lower(a.code)
             AND p.type = 'registration'
             AND p.status = 'completed'
             AND p.amount > 0),
         (SELECT COUNT(DISTINCT d.id)::int
            FROM public.dogs d
            JOIN public.payments p ON p.dog_id = d.id
           WHERE lower(d.ref_code) = lower(a.code)
             AND p.type = 'registration'
             AND p.status = 'completed'
             AND p.amount > 0) * a.reward_cents,
         a.paid
  FROM public.affiliates a
  WHERE lower(a.code) = lower(_code) AND a.active = true;
$function$;