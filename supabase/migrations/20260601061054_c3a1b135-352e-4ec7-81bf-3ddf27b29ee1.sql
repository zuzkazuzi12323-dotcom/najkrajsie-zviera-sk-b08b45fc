-- Drop the security-definer view (replaced by column-level protection)
DROP VIEW IF EXISTS public.public_profiles;

-- Restore public read on profiles, but at the COLUMN level so email stays private
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;

CREATE POLICY "Profiles viewable by everyone"
ON public.profiles FOR SELECT
USING (true);

-- Anonymous visitors: revoke blanket access, grant only non-PII columns
REVOKE SELECT ON public.profiles FROM anon;
GRANT SELECT (id, user_id, display_name, avatar_url, blocked, created_at, updated_at)
ON public.profiles TO anon;

-- Authenticated users keep full access (needed for admin email management)
GRANT SELECT ON public.profiles TO authenticated;