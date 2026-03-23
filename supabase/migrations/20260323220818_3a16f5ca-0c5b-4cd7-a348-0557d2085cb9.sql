-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notifications;

-- Admin can update contest settings
CREATE POLICY "Admins can update contest settings" ON public.contest_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Admin can delete votes (for reset)
CREATE POLICY "Admins can delete votes" ON public.votes FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
