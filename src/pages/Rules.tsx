import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { BookOpen, CheckCircle, Trophy, Gift, CreditCard, Handshake } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PAID_PRICE_LABEL, REGISTRATION_FREE } from "@/lib/pricing";

const Rules = () => {
  const free = REGISTRATION_FREE;
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-10 max-w-3xl overflow-hidden">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl gradient-golden flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Pravidlá súťaže</h1>
          </div>

          <div className="bg-card rounded-2xl p-6 md:p-8 shadow-elevated space-y-8 break-words overflow-hidden">
            <p className="text-foreground/80 text-lg leading-relaxed">
              Súťaž NajkrajšíPes.eu je online súťaž o najkrajšieho psa na Slovensku.
            </p>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" /> Ako sa zapojiť
              </h2>
              <ol className="space-y-3 text-foreground/80 list-none w-full">
                <li className="block w-full break-words"><span className="font-bold text-primary">1.</span> Majiteľ psa pridá profil psa s fotkou.</li>
                <li className="block w-full break-words"><span className="font-bold text-primary">2.</span> {free
                  ? <>V kole august 2026 (1. 8. – 31. 8. 2026) je registrácia psa <strong>ZADARMO</strong>. Od 1. 9. 2026 je poplatok <strong>1,99 €</strong> (20 % ide útulkom ❤️).</>
                  : <>Podpora projektu je <strong>{PAID_PRICE_LABEL}</strong> – 20 % z každej úspešnej registrácie je REZERVOVANÝCH pre spolupracujúce útulky ❤️</>}
                </li>
                <li className="block w-full break-words"><span className="font-bold text-primary">2a.</span> Hlasovať môžete <strong>1× za 24 hodín</strong> z jedného účtu.</li>
                <li className="block w-full break-words"><span className="font-bold text-primary">3.</span> {free
                  ? <>Po odoslaní prihlášky sa pes <strong>okamžite zaradí do súťaže</strong> a môže získavať hlasy.</>
                  : <>Po úspešnej platbe sa pes okamžite zobrazí v galérii a môže získavať hlasy od návštevníkov.</>}
                </li>
              </ol>

            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" /> Registrácia a platba
              </h2>
              <ul className="space-y-3 text-foreground/80">
                {free ? (
                  <>
                    <li className="break-words"><span className="font-bold text-primary">•</span> Kým prebieha aktuálna súťaž, registrácia psa je <strong>ZADARMO</strong> — bez akéhokoľvek poplatku.</li>
                    <li className="break-words"><span className="font-bold text-primary">•</span> Po ukončení súťaže sa poplatok <strong>automaticky nastaví na {PAID_PRICE_LABEL}</strong> za registráciu psa.</li>
                    <li className="break-words"><span className="font-bold text-primary">•</span> Počas súťaže sa pes <strong>ihneď zaradí do galérie a rebríčka</strong> po odoslaní prihlášky.</li>
                  </>
                ) : (
                  <>
                    <li className="break-words"><span className="font-bold text-primary">•</span> Pes sa zaradí do súťaže <strong>až po úhrade</strong> podpory projektu {PAID_PRICE_LABEL}.</li>
                    <li className="break-words"><span className="font-bold text-primary">•</span> Bez zaplatenia sa pes <strong>nezobrazí v galérii ani v rebríčku</strong> a nemôže prijímať hlasy.</li>
                    <li className="break-words"><span className="font-bold text-primary">•</span> Ak platbu zrušíte, zobrazí sa upozornenie, že pes nebol pridaný, a jeho neuhradená registrácia sa automaticky odstráni. Psa môžete kedykoľvek pridať znova.</li>
                  </>
                )}
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" /> Ako sa vyberá víťaz
              </h2>
              <p className="text-foreground/80">
                Pes s najväčším počtom hlasov vyhráva titul <strong>Najkrajší pes Slovenska</strong>.
              </p>
              <p className="text-foreground/80 mt-2">
                Súťaž prebieha každý mesiac a každý mesiac bude vyhlásený nový víťaz. Po ukončení ročníka sa psy archivujú a už nemôžu prijímať ďalšie hlasy.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Gift className="w-5 h-5 text-primary" /> Výhra
              </h2>
              <p className="text-foreground/80">
                Víťazný pes získa <strong>darček od partnerov súťaže</strong>, <strong>certifikát víťaza</strong> a prestížne ocenenie <strong>Najkrajší pes Slovenska</strong>.
              </p>
              <p className="text-foreground/80 mt-3">
                Po ukončení súťaže bude výherca kontaktovaný e-mailom. Po potvrdení doručovacích údajov bude výhra odoslaná na adresu výhercu.
              </p>
              <p className="text-foreground/80 mt-3">
                Výherca bude kontaktovaný e-mailom alebo cez účet na stránke. Ak sa neozve do <strong>14 dní</strong> od oznámenia výhry, organizátor si vyhradzuje právo odovzdať cenu ďalšiemu súťažiacemu v poradí.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Handshake className="w-5 h-5 text-primary" /> Partneri a sponzori
              </h2>
              <p className="text-foreground/80">
                Súťaž podporujú partneri a sponzori, ktorí prispievajú cenami a pomáhajú útulkom. Ak máte záujem o spoluprácu,
                pozrite si možnosti na stránke{" "}
                <Link to="/partneri" className="text-primary font-medium hover:underline">Partneri a sponzori</Link>{" "}
                alebo nám napíšte na{" "}
                <a href="mailto:infonajkrajsipes@gmail.com" className="text-primary font-medium hover:underline break-all">infonajkrajsipes@gmail.com</a>.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Handshake className="w-5 h-5 text-primary" /> Registrácia útulkov
              </h2>
              <ul className="space-y-3 text-foreground/80">
                <li className="break-words"><span className="font-bold text-primary">•</span> Slovenské útulky sa môžu prihlásiť do projektu cez formulár na stránke <Link to="/spolupraca-utulky" className="text-primary font-medium hover:underline">Spolupráca s útulkami</Link>.</li>
                <li className="break-words"><span className="font-bold text-primary">•</span> Každá žiadosť sa <strong>neuverejňuje automaticky</strong> – uloží sa do administrácie a je ručne posúdená a schválená organizátorom.</li>
                <li className="break-words"><span className="font-bold text-primary">•</span> Odoslaním formulára žiadateľ potvrdzuje <strong>pravdivosť uvedených údajov</strong> a súhlasí so spracovaním osobných údajov.</li>
                <li className="break-words"><span className="font-bold text-primary">•</span> Organizátor si vyhradzuje právo žiadosť <strong>zamietnuť alebo odstrániť</strong> pri podozrení na podvod alebo pri nepravdivých údajoch.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Handshake className="w-5 h-5 text-primary" /> ❤️ Útulok týždňa
              </h2>
              <ul className="space-y-3 text-foreground/80">
                <li className="break-words"><span className="font-bold text-primary">•</span> Každý týždeň zverejňujeme jeden <strong>aktuálne podporovaný útulok</strong>, ktorý sa automaticky strieda.</li>
                <li className="break-words"><span className="font-bold text-primary">•</span> Útulku môžete prispieť priamo cez <strong>SEPA QR kód</strong> na jeho profile – <strong>100 %</strong> vášho príspevku ide priamo na účet útulku.</li>
                <li className="break-words"><span className="font-bold text-primary">•</span> NajkrajšíPes.eu nie je sprostredkovateľ platby a tieto finančné prostriedky neprijíma.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Handshake className="w-5 h-5 text-primary" /> Rezervovaná suma pre útulky
              </h2>
              <p className="text-foreground/80">
                20 % z každej úspešnej registrácie je <strong>REZERVOVANÝCH</strong> pre spolupracujúce útulky. 80 % ide na
                prevádzku stránky, vývoj, Stripe poplatky a ceny. Organizátorovi nejde priamy zisk.
              </p>
              <p className="text-foreground/80 mt-3">
                Ak v danom kole nespolupracuje žiadny útulok, rezervovaná suma 20 % sa neprepadá, ale presúva sa a akumuluje do
                ďalšieho kola, kým sa neprihlási prvý útulok. Peniaze určené pre útulky nikdy neostávajú prevádzke.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" /> Pravidlá hlasovania a platby
              </h2>
              <ul className="space-y-3 text-foreground/80">
                <li className="break-words"><span className="font-bold text-primary">•</span> <strong>1 účet = 1 hlas za 24 hodín.</strong></li>
                <li className="break-words"><span className="font-bold text-primary">•</span> Zakázané je používanie botov, automatizovaných skriptov a kupovanie hlasov.</li>
                <li className="break-words"><span className="font-bold text-primary">•</span> Organizátor má právo vyradiť súťažiaceho pri podvode alebo manipulácii hlasovania.</li>
                <li className="break-words"><span className="font-bold text-primary">•</span> V augustovom kole je registrácia <strong>ZADARMO</strong>; od septembra 2026 je registrácia <strong>1,99 €</strong> dobrovoľná podpora projektu a je <strong>nevratná</strong>, okrem technickej chyby na strane platby.</li>
                <li className="break-words"><span className="font-bold text-primary">•</span> Reklamácie posielajte na <a href="mailto:infonajkrajsipes@gmail.com" className="text-primary font-medium hover:underline break-all">infonajkrajsipes@gmail.com</a> do <strong>14 dní</strong>.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Handshake className="w-5 h-5 text-primary" /> Prevádzkovateľ a ochrana údajov
              </h2>
              <ul className="space-y-3 text-foreground/80">
                <li className="break-words"><span className="font-bold text-primary">•</span> Prevádzkovateľ: <strong>Zuzana Biháriová</strong>, fyzická osoba, kontakt <a href="mailto:infonajkrajsipes@gmail.com" className="text-primary font-medium hover:underline break-all">infonajkrajsipes@gmail.com</a>.</li>
                <li className="break-words"><span className="font-bold text-primary">•</span> Zbierame: meno psa, fotku psa, meno majiteľa, e-mail a platby cez Stripe (údaje o karte nevidíme).</li>
                <li className="break-words"><span className="font-bold text-primary">•</span> Účel: súťaž Najkrajší pes Slovenska, hlasovanie a informovanie o súťaži.</li>
                <li className="break-words"><span className="font-bold text-primary">•</span> Uchovanie: do konca súťaže + 30 dní, potom údaje na požiadanie vymažeme.</li>
                <li className="break-words"><span className="font-bold text-primary">•</span> Práva: prístup, oprava a vymazanie údajov – e-mailom.</li>
                <li className="break-words"><span className="font-bold text-primary">•</span> Cookies: len nevyhnutné pre hlasovanie a fungovanie stránky.</li>
                <li className="break-words"><span className="font-bold text-primary">•</span> Podrobnosti na stránke <Link to="/ochrana-udajov" className="text-primary font-medium hover:underline">Ochrana osobných údajov</Link>.</li>
              </ul>
            </div>

          </div>

        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default Rules;
