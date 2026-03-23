-- Add approved status to dogs
ALTER TABLE public.dogs ADD COLUMN IF NOT EXISTS approved boolean NOT NULL DEFAULT false;

-- Update existing dogs to approved
UPDATE public.dogs SET approved = true;

-- Contest settings table
CREATE TABLE public.contest_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  active boolean NOT NULL DEFAULT true,
  end_date timestamp with time zone,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

INSERT INTO public.contest_settings (id, active) VALUES ('00000000-0000-0000-0000-000000000002', true);

ALTER TABLE public.contest_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read contest settings" ON public.contest_settings FOR SELECT USING (true);

-- Admin notifications table
CREATE TABLE public.admin_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  reference_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage notifications" ON public.admin_notifications FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Trigger to create notification when dog is added
CREATE OR REPLACE FUNCTION public.notify_new_dog()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_notifications (type, message, reference_id)
  VALUES ('new_dog', 'Nový pes bol pridaný: ' || NEW.name, NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_dog AFTER INSERT ON public.dogs
FOR EACH ROW EXECUTE FUNCTION public.notify_new_dog();

-- Trigger to create notification when payment is made
CREATE OR REPLACE FUNCTION public.notify_new_payment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_notifications (type, message, reference_id)
  VALUES ('new_payment', 'Nová platba: ' || (NEW.amount / 100.0)::text || ' €', NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_payment AFTER INSERT ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.notify_new_payment();

-- Allow admin to update payments
CREATE POLICY "Admins can update payments" ON public.payments FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
