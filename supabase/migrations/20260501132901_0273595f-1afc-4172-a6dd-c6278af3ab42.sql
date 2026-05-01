
-- Tabulka pre editovatelne texty webu
CREATE TABLE public.site_content (
  key text PRIMARY KEY,
  page text NOT NULL,
  label text NOT NULL,
  value text NOT NULL DEFAULT '',
  type text NOT NULL DEFAULT 'text',
  sort_order integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site content viewable by everyone"
  ON public.site_content FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert site content"
  ON public.site_content FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update site content"
  ON public.site_content FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete site content"
  ON public.site_content FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER site_content_updated_at
  BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed pociatocnych textov
INSERT INTO public.site_content (key, page, label, value, type, sort_order) VALUES
  -- DOMOV
  ('home.hero.badge', 'home', 'Hero - badge nad nadpisom', 'Súťaž 2026 prebieha', 'text', 10),
  ('home.hero.title', 'home', 'Hero - hlavný nadpis', 'Najkrajší pes Slovenska', 'text', 20),
  ('home.hero.subtitle', 'home', 'Hero - podnadpis', 'Pridaj svojho miláčika do súťaže zadarmo a podpor útulky pre zvieratá.', 'textarea', 30),
  ('home.hero.cta_primary', 'home', 'Hero - tlačidlo (primárne)', 'Pridať psa do súťaže zadarmo', 'button', 40),
  ('home.hero.cta_secondary', 'home', 'Hero - tlačidlo (sekundárne)', 'Podporiť útulky ❤️', 'button', 50),
  ('home.top.title', 'home', 'Sekcia TOP psy - nadpis', 'Najobľúbenejšie psy', 'text', 100),
  ('home.top.subtitle', 'home', 'Sekcia TOP psy - podnadpis', 'Pozri sa, ktoré psy momentálne vedú', 'text', 110),
  ('home.newest.title', 'home', 'Najnovšie pridané - nadpis', 'Najnovšie pridaní', 'text', 200),
  ('home.newest.subtitle', 'home', 'Najnovšie pridané - podnadpis', 'Spoznaj najnovších členov našej súťaže', 'text', 210),
  ('home.boost.title', 'home', 'Boost sekcia - nadpis', 'Podpor svojho favorita boost hlasmi 🚀', 'text', 300),
  ('home.boost.subtitle', 'home', 'Boost sekcia - popis', 'Časť výťažku ide na podporu útulkov pre zvieratá.', 'textarea', 310),
  ('home.boost.pkg1', 'home', 'Boost balíček 1', '1 € → 30 hlasov', 'text', 320),
  ('home.boost.pkg2', 'home', 'Boost balíček 2', '3 € → 90 hlasov', 'text', 330),
  ('home.boost.pkg3', 'home', 'Boost balíček 3', '5 € → 120 hlasov', 'text', 340),
  ('home.boost.pkg4', 'home', 'Boost balíček 4', '10 € → 500 hlasov', 'text', 350),

  -- PRIVACY
  ('privacy.title', 'privacy', 'Hlavný nadpis', 'Ochrana osobných údajov', 'text', 10),
  ('privacy.intro', 'privacy', 'Úvodný odsek', 'Stránka NajkrajšíPes.sk zbiera a spracúva iba údaje nevyhnutné pre fungovanie súťaže a doručenie výhry víťazovi. Vaše práva sú pre nás prioritou.', 'textarea', 20),
  ('privacy.section1.title', 'privacy', 'Sekcia 1 - nadpis', 'Aké údaje zbierame', 'text', 100),
  ('privacy.section1.body', 'privacy', 'Sekcia 1 - text (každý riadok = bod)', 'E-mailová adresa (pre registráciu a komunikáciu)
Meno alebo prezývka (pre zobrazenie v súťaži)
Fotografie a informácie o psovi (pre profil psa v galérii)
Platobné údaje (spracúvané zabezpečene cez platobnú bránu Stripe)
Informácie o zakúpených boost hlasoch (priradené k vášmu účtu a profilu psa)
Informácie o príspevkoch pre útulky (vrátane vlastných súm)', 'textarea', 110),
  ('privacy.section2.title', 'privacy', 'Sekcia 2 - nadpis', 'Účel spracovania', 'text', 200),
  ('privacy.section2.body', 'privacy', 'Sekcia 2 - text', 'Údaje používame výhradne na fungovanie súťaže, hlasovanie, prevádzku boost systému, kontaktovanie výhercov a zasielanie informácií o priebehu súťaže. Časť výťažku z boost hlasov a darov ide na podporu útulkov pre zvieratá.', 'textarea', 210),
  ('privacy.section3.title', 'privacy', 'Sekcia 3 - nadpis', 'Hlasovanie a boost hlasy', 'text', 300),
  ('privacy.section3.body', 'privacy', 'Sekcia 3 - text', 'Bezplatné hlasy sú obmedzené na 1 hlas za 24 hodín na používateľa/IP adresu. Boost hlasy sú zaplatené hlasy, ktoré sa pripočítavajú k súčtu psa iba po úspešnej platbe overenej cez Stripe webhook. V prípade neuskutočnenej platby sa hlasy nepripočítavajú.', 'textarea', 310),
  ('privacy.section4.title', 'privacy', 'Sekcia 4 - nadpis', 'Vaše práva', 'text', 400),
  ('privacy.section4.body', 'privacy', 'Sekcia 4 - text', 'Máte právo na prístup k svojim údajom, ich opravu, vymazanie a prenosnosť v súlade s GDPR. Pre uplatnenie práv nás kontaktujte na info@najkrajsiepes.sk.', 'textarea', 410),

  -- RULES
  ('rules.title', 'rules', 'Hlavný nadpis', 'Pravidlá súťaže', 'text', 10),
  ('rules.intro', 'rules', 'Úvod', 'Súťaž NajkrajšíPes.sk je otvorená pre všetkých milovníkov psov. Prečítajte si pravidlá pred zapojením.', 'textarea', 20),
  ('rules.body', 'rules', 'Hlavný text pravidiel', 'Registrácia psa do súťaže je úplne ZADARMO.
Každý používateľ môže pridať viacero psov.
Bezplatné hlasovanie: 1 hlas za 24 hodín.
Boost hlasy sú platené a pripočítavajú sa po úspešnej platbe.
Časť výťažku ide na podporu útulkov.
Víťaz získava cenu opísanú v aktuálnom kole súťaže.', 'textarea', 30),

  -- FOOTER
  ('footer.tagline', 'footer', 'Footer - krátky popis', 'Súťaž o najkrajšieho psa s podporou útulkov.', 'text', 10),
  ('footer.copyright', 'footer', 'Footer - copyright', '© 2026 NajkrajšíPes.sk – Všetky práva vyhradené', 'text', 100),

  -- ADD DOG
  ('adddog.title', 'adddog', 'Nadpis stránky', 'Pridať psa do súťaže zadarmo', 'text', 10),
  ('adddog.subtitle', 'adddog', 'Podnadpis', 'Vyplň údaje o svojom psovi a zapoj sa do súťaže.', 'textarea', 20),
  ('adddog.cta', 'adddog', 'Tlačidlo odoslať', 'Pridať psa zadarmo', 'button', 30),

  -- LOGIN
  ('login.title', 'login', 'Nadpis', 'Vitajte späť', 'text', 10),
  ('login.subtitle', 'login', 'Podnadpis', 'Prihláste sa do svojho účtu', 'text', 20),
  ('login.cta', 'login', 'Tlačidlo prihlásiť', 'Prihlásiť sa', 'button', 30),
  ('login.forgot', 'login', 'Odkaz - zabudnuté heslo', 'Zabudli ste heslo?', 'text', 40),

  -- REGISTER
  ('register.title', 'register', 'Nadpis', 'Vytvorte si účet', 'text', 10),
  ('register.subtitle', 'register', 'Podnadpis', 'Pridajte svojho psa do súťaže', 'text', 20),
  ('register.cta', 'register', 'Tlačidlo registrácia', 'Zaregistrovať sa', 'button', 30),

  -- DONATE
  ('donate.title', 'donate', 'Nadpis', 'Podporte útulky pre zvieratá ❤️', 'text', 10),
  ('donate.subtitle', 'donate', 'Podnadpis', 'Bez registrácie. Vyber si sumu alebo zadaj vlastnú.', 'textarea', 20),
  ('donate.cta', 'donate', 'Tlačidlo podporiť', 'Podporiť útulky', 'button', 30),

  -- CONTACT
  ('contact.title', 'contact', 'Nadpis', 'Kontaktujte nás', 'text', 10),
  ('contact.subtitle', 'contact', 'Podnadpis', 'Sme tu pre vás. Napíšte nám.', 'text', 20),
  ('contact.email', 'contact', 'Kontaktný email', 'info@najkrajsiepes.sk', 'text', 30),

  -- HOW IT WORKS
  ('howitworks.title', 'howitworks', 'Nadpis', 'Ako to funguje', 'text', 10),
  ('howitworks.subtitle', 'howitworks', 'Podnadpis', 'V troch jednoduchých krokoch sa zapojíte do súťaže.', 'textarea', 20),
  ('howitworks.step1.title', 'howitworks', 'Krok 1 - nadpis', '1. Pridajte psa zadarmo', 'text', 100),
  ('howitworks.step1.body', 'howitworks', 'Krok 1 - text', 'Zaregistrujte sa a pridajte fotku a informácie o vašom psovi.', 'textarea', 110),
  ('howitworks.step2.title', 'howitworks', 'Krok 2 - nadpis', '2. Zdieľajte a hlasujte', 'text', 200),
  ('howitworks.step2.body', 'howitworks', 'Krok 2 - text', 'Zdieľajte profil svojho psa s rodinou a priateľmi. Každý môže hlasovať 1× za 24 hodín zadarmo.', 'textarea', 210),
  ('howitworks.step3.title', 'howitworks', 'Krok 3 - nadpis', '3. Boost a podpora útulkov', 'text', 300),
  ('howitworks.step3.body', 'howitworks', 'Krok 3 - text', 'Kúpte boost hlasy pre svojho favorita. Časť výťažku ide na podporu útulkov pre zvieratá.', 'textarea', 310);
