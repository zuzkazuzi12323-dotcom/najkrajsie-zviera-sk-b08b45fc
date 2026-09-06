CREATE TABLE public.book_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dog_name TEXT NOT NULL,
  breed TEXT,
  age TEXT,
  story TEXT,
  ai_help BOOLEAN NOT NULL DEFAULT false,
  photos TEXT[] NOT NULL DEFAULT '{}',
  customer_name TEXT NOT NULL,
  address TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  amount INTEGER NOT NULL DEFAULT 2999,
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.book_orders TO anon, authenticated;
GRANT SELECT ON public.book_orders TO authenticated;
GRANT ALL ON public.book_orders TO service_role;
ALTER TABLE public.book_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can create a book order" ON public.book_orders FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can view book orders" ON public.book_orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can upload book photos" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'book-photos');
CREATE POLICY "Admins can read book photos" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'book-photos' AND public.has_role(auth.uid(), 'admin'));