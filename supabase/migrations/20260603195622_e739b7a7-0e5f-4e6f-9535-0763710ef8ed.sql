-- Remove obsolete boost content rows
DELETE FROM public.site_content WHERE key LIKE 'home.boost.%';

-- Add banner_text column for richer banner control
ALTER TABLE public.sponsors ADD COLUMN IF NOT EXISTS banner_text text;

-- Seed editable texts for partners & winner & banners
INSERT INTO public.site_content (key, page, label, value, type, sort_order) VALUES
  ('home.partners.title', 'home', 'Partneri - nadpis', 'Oficiálni partneri súťaže Najkrajší pes Slovenska', 'text', 400),
  ('home.partners.subtitle', 'home', 'Partneri - podnadpis', 'Ďakujeme našim partnerom, ktorí podporujú súťaž a pomáhajú zvieratkám ❤️', 'textarea', 410),
  ('partners.title', 'partners', 'Nadpis stránky', 'Naši partneri', 'text', 10),
  ('partners.subtitle', 'partners', 'Podnadpis', 'Spoločnosti a značky, ktoré podporujú súťaž Najkrajší pes Slovenska.', 'textarea', 20),
  ('partners.empty', 'partners', 'Text keď nie sú partneri', 'Momentálne pripravujeme spoluprácu s partnermi. Čoskoro tu nájdete našich partnerov.', 'textarea', 30),
  ('prize.title', 'home', 'Výhra - nadpis', '🏆 Čo získa víťaz', 'text', 500),
  ('prize.body', 'home', 'Výhra - popis', 'Víťazný pes získa darček od partnerov súťaže, certifikát víťaza a prestížne ocenenie Najkrajší pes Slovenska.', 'textarea', 510),
  ('prize.delivery', 'home', 'Výhra - doručenie', 'Po ukončení súťaže bude výherca kontaktovaný e-mailom. Po potvrdení doručovacích údajov bude výhra odoslaná na adresu výhercu.', 'textarea', 520),
  ('adddog.price_note', 'adddog', 'Registrácia - cena', 'Registrácia psa do súťaže stojí jednorazovo 2,99 €. Psa môžete pridať až po úspešnej platbe. 20 % z platby venujeme útulkom ❤️', 'textarea', 40)
ON CONFLICT (key) DO NOTHING;