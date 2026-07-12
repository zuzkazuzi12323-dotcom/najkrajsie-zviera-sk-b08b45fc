DROP POLICY IF EXISTS "Users can insert own dogs" ON public.dogs;
CREATE POLICY "Users can insert own dogs" ON public.dogs
FOR INSERT
WITH CHECK (
  (auth.uid() = owner_id)
  AND (highlighted = false)
  AND (boost_votes = 0)
  AND (is_winner = false)
  AND (winner_place IS NULL)
  AND (archived = false)
  AND (NOT is_blocked())
);