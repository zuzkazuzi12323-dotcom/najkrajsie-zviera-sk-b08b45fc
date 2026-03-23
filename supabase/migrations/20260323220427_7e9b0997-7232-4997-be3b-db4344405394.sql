-- Allow service role to delete payments (for account deletion)
CREATE POLICY "Service can delete payments" ON public.payments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Allow service role to delete profiles
CREATE POLICY "Users can delete own profile" ON public.profiles FOR DELETE TO authenticated USING (auth.uid() = user_id);
