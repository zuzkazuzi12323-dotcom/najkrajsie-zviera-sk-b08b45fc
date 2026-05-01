## Cieľ

Pridať tri veci:
1. **CMS editor v admin paneli** — meniť všetky texty, nadpisy, popisy a tlačidlá na webe bez kódu (vrátane Privacy Policy, Pravidiel, Domov, Footer, AddDog, Login, Register, Donate, Kontakt, Ako to funguje atď.).
2. **Archivácia psov** — psi, ktorí už súťažili, zostanú v galérii viditeľní, ale nedajú sa pre nich pridávať hlasy (free ani boost).
3. **Bezpečnejšie prihlásenie** — pridať povinné potvrdenie emailu pred prihlásením + funkčný reset hesla („Zabudnuté heslo“).

---

## Časť 1 — CMS editor obsahu

### Databáza

Nová tabuľka `site_content`:

```text
site_content
├─ key (text, PK)        napr. "home.hero.title", "privacy.section1.body"
├─ page (text)           "home" | "privacy" | "rules" | "footer" | ...
├─ label (text)          ľudský popis pre admina ("Hlavný nadpis na úvode")
├─ value (text)          aktuálny text (môže byť aj viacriadkový / HTML-light)
├─ type (text)           "text" | "textarea" | "html" | "button"
├─ sort_order (int)
└─ updated_at (timestamptz)
```

RLS: čítanie pre všetkých (verejný web), zápis len pre adminov (`has_role(auth.uid(),'admin')`).

Naseedujem všetky texty zo súčasných stránok ako počiatočné riadky (cca 80–120 záznamov rozdelených podľa `page`).

### Frontend — helper

Nový hook `useSiteContent(key, fallback)`:
- načíta všetky texty raz cez React Query a cachuje
- v komponente: `const t = useSiteContent(); ... <h1>{t("home.hero.title", "Nájdi najkrajšieho psa")}</h1>`
- fallback = pôvodný text, takže keď riadok ešte neexistuje, web funguje normálne

Postupne nahradím tvrdo zapísané texty v týchto súboroch volaniami `t(key, fallback)`:
`Index.tsx`, `Privacy.tsx`, `Rules.tsx`, `HowItWorks.tsx`, `Contact.tsx`, `Donate.tsx`, `AddDog.tsx`, `Login.tsx`, `Register.tsx`, `Footer.tsx`, `Navbar.tsx`, `Winners.tsx`, `Leaderboard.tsx`, `Gallery.tsx`, `DogProfile.tsx`, `EShop.tsx`, `MyProfile.tsx`, `AccountSettings.tsx`.

### Admin stránka `/admin/obsah` (nová)

- ľavé menu: zoznam stránok (Domov, Privacy, Pravidlá, Footer, …)
- pravá strana: zoznam všetkých polí danej stránky s ľudským popisom (`label`) a inline editorom
  - krátke `text` → `<input>`
  - dlhé `textarea` / `html` → `<textarea>` (s náhľadom)
  - `button` → editor textu tlačidla
- tlačidlo „Uložiť všetko“ uloží zmeny hromadne
- po uložení sa frontend hneď obnoví (invalidate React Query)
- pridám položku **„Obsah stránok“** do `AdminLayout` navigácie

---

## Časť 2 — Archivácia psov

### Databáza

Migrácia: pridať stĺpec `archived boolean NOT NULL DEFAULT false` do tabuľky `dogs`.

### Pravidlá hlasovania

- **Free hlas**: blokovať vloženie do `votes`, ak `dogs.archived = true`. Najčistejšie cez DB trigger `BEFORE INSERT ON votes` → `RAISE EXCEPTION` ak je pes archivovaný. Frontend tlačidlo Hlasovať skryje / disabledne.
- **Boost (platený)**: edge funkcia `create-boost-checkout` na začiatku skontroluje `archived`; ak áno, vráti chybu a checkout sa nevytvorí. Frontend tlačidlo Boost rovnako disabledne.

### Frontend

- `DogCard` zobrazí badge **„Archivovaný — súťažil v predchádzajúcom kole“** namiesto tlačidla Hlasovať.
- `DogProfile` skryje hlasovací aj boost panel a zobrazí informačný banner.
- `Leaderboard` a `TopDogs` (Index) **nezobrazujú** archivovaných psov; v `Gallery` a `Winners` zostávajú viditeľní (s badgeom).

### Admin

V `AdminDogs` pridať:
- nový stĺpec/akciu **Archivovať / Obnoviť** (ikona archív)
- filter „Archivovaní“
- hromadnú akciu **„Archivovať všetkých schválených“** (pre koniec ročníka) s potvrdzovacím dialógom

---

## Časť 3 — Bezpečnejšie prihlásenie

### Potvrdenie emailu

- vypnúť auto-confirm (cez `configure_auth`), aby Supabase automaticky posielal confirmation email
- v `Login.tsx` pri chybe `Email not confirmed` zobraziť jasnú hlášku: „Najprv potvrďte svoj email kliknutím na odkaz, ktorý sme vám poslali.“ + tlačidlo **„Poslať potvrdzovací email znova“** (`supabase.auth.resend({ type: 'signup', email })`)
- v `Register.tsx` po registrácii presmerovať na info stránku „Skontrolujte svoj email“

### Reset hesla

- nová stránka **`/zabudnute-heslo`** (`ForgotPassword.tsx`):
  - email input → `supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '/reset-hesla' })`
- nová stránka **`/reset-hesla`** (`ResetPassword.tsx`):
  - polia nové heslo + potvrdenie
  - `supabase.auth.updateUser({ password })`
  - po úspechu redirect na `/prihlasenie`
- v `Login.tsx` pridať odkaz **„Zabudli ste heslo?“** pod heslové pole
- pridať routy do `App.tsx` (verejné, bez auth guardu)

### Voliteľne (zmienim, ale nezahŕňam, kým nepovieš)
- HIBP kontrola uniknutých hesiel
- Emaily s vlastným brandingom (Lovable Cloud → Emails)

---

## Technické detaily (pre vývoj)

- **Migrácie**: 2 nové migrácie — `site_content` tabuľka + seed; `dogs.archived` + trigger na `votes`.
- **Edge function update**: `create-boost-checkout/index.ts` — kontrola `archived` pred Stripe checkoutom.
- **Nové súbory**: `src/hooks/useSiteContent.ts`, `src/pages/admin/AdminContent.tsx`, `src/pages/ForgotPassword.tsx`, `src/pages/ResetPassword.tsx`.
- **Upravené**: `AdminLayout.tsx` (nová položka menu), `App.tsx` (nové routy), `Login.tsx`, `Register.tsx`, `AdminDogs.tsx`, `DogCard.tsx`, `DogProfile.tsx`, `Index.tsx`, `Leaderboard.tsx`, plus všetky stránky pre integráciu `useSiteContent`.
- **Auth nastavenia**: `configure_auth` → vyžadovať email confirm.
- **Postupný prístup k CMS**: integrácia `useSiteContent` prebehne pre kľúčové stránky (Domov, Privacy, Pravidlá, Footer, AddDog, Donate, Login, Register, Kontakt, HowItWorks) v rámci tejto úlohy; ostatné menšie texty sa dajú dorobiť neskôr rovnakým vzorom.

---

## Plán krokov

1. Migrácia: `site_content` + seed všetkých textov + RLS.
2. Migrácia: `dogs.archived` + trigger na `votes` blokujúci hlasy archivovaných.
3. Update edge funkcie `create-boost-checkout` (kontrola archived).
4. `useSiteContent` hook + integrácia do hlavných stránok a Footera.
5. Admin stránka `/admin/obsah` + položka v `AdminLayout` menu.
6. `AdminDogs` — tlačidlo Archivovať/Obnoviť, filter, hromadná akcia.
7. `DogCard` / `DogProfile` / `Leaderboard` / `Index` — rešpektovanie `archived`.
8. `configure_auth` → požadovať potvrdenie emailu.
9. `Login.tsx` — hláška „email nepotvrdený“ + Resend + odkaz na zabudnuté heslo.
10. `ForgotPassword.tsx` + `ResetPassword.tsx` + routy v `App.tsx`.
11. Otestovať: archivovaný pes nedostane hlas (free aj boost), CMS úprava textu sa prejaví, reset hesla funguje, neoverený user sa neprihlási.
