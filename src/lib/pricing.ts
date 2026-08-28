// Centralizované ceny a texty registrácie psa do súťaže.
// Súťaž prebieha KAŽDÝ MESIAC – každé kolo má vlastný názov a vlastný cenník.
//
// Všetko sa prepína AUTOMATICKY podľa aktuálneho dátumu:
//   - v mesiaci uvedenom v FREE_MONTHS je registrácia zadarmo (0 €)
//   - v každom inom mesiaci je registrácia PAID_PRICE_LABEL (1,99 €)
// Netreba nič meniť ručne – názvy mesiacov aj ceny sa generujú samé.

export const PAID_PRICE_CENTS = 199;
export const PAID_PRICE_LABEL = "1,99 €";
export const FREE_PRICE_LABEL = "0 €";

/** Mesiace s akciou „registrácia zadarmo“ vo formáte YYYY-MM. */
const FREE_MONTHS: string[] = ["2026-08"];

const MONTH_ADJ = [
  "Januárová", "Februárová", "Marcová", "Aprílová", "Májová", "Júnová",
  "Júlová", "Augustová", "Septembrová", "Októbrová", "Novembrová", "Decembrová",
];
const MONTH_LOC = [
  "januári", "februári", "marci", "apríli", "máji", "júni",
  "júli", "auguste", "septembri", "októbri", "novembri", "decembri",
];
const MONTH_GEN = [
  "januára", "februára", "marca", "apríla", "mája", "júna",
  "júla", "augusta", "septembra", "októbra", "novembra", "decembra",
];

const now = new Date();
const YEAR = now.getFullYear();
const MONTH = now.getMonth(); // 0-11
const monthKey = (y: number, m: number) => `${y}-${String(m + 1).padStart(2, "0")}`;

const NEXT_MONTH = (MONTH + 1) % 12;
const NEXT_YEAR = MONTH === 11 ? YEAR + 1 : YEAR;

/** Je registrácia v aktuálnom mesiaci zadarmo? (automaticky podľa dátumu) */
export const REGISTRATION_FREE: boolean = FREE_MONTHS.includes(monthKey(YEAR, MONTH));

/** Bude registrácia zadarmo aj nasledujúci mesiac? */
export const NEXT_MONTH_FREE: boolean = FREE_MONTHS.includes(monthKey(NEXT_YEAR, NEXT_MONTH));

/** Aktuálne kolo súťaže, napr. „Septembrová súťaž 2026“. */
export const ROUND_LABEL = `${MONTH_ADJ[MONTH]} súťaž ${YEAR}`;

/** Pomocné tvary aktuálneho a nasledujúceho mesiaca. */
export const CURRENT_MONTH_LOCATIVE = `${MONTH_LOC[MONTH]} ${YEAR}`; // „v septembri 2026“
export const CURRENT_MONTH_GENITIVE = `${MONTH_GEN[MONTH]} ${YEAR}`;
export const NEXT_MONTH_GENITIVE = `${MONTH_GEN[NEXT_MONTH]} ${NEXT_YEAR}`;

const daysInMonth = new Date(YEAR, MONTH + 1, 0).getDate();
/** Presné obdobie kola, napr. „kolo september 2026 (1. 9. – 30. 9. 2026)“. */
export const ROUND_PERIOD_TEXT = `kolo ${MONTH_LOC[MONTH]} ${YEAR} (1. ${MONTH + 1}. – ${daysInMonth}. ${MONTH + 1}. ${YEAR})`;

/** Aktuálna cena registrácie ako text. */
export const registrationPriceLabel = (free: boolean = REGISTRATION_FREE): string =>
  free ? FREE_PRICE_LABEL : PAID_PRICE_LABEL;

/** Cena aktuálneho kola ako text (0 € / 1,99 €). */
export const CURRENT_PRICE_LABEL = registrationPriceLabel();

/** Jednotný text o rozdelení podpory 20 / 80. */
export const RESERVED_SHARE_TEXT =
  "20 % z každej úspešnej registrácie je REZERVOVANÝCH pre spolupracujúce útulky. 80 % ide na prevádzku, ceny a poplatky.";

/** Krátky nadpis aktuálneho kola. */
export const FREE_ROUND_TITLE = REGISTRATION_FREE
  ? `🐶 ${ROUND_LABEL.toUpperCase()} – REGISTRÁCIA ZADARMO!`
  : `🐾 ${ROUND_LABEL.toUpperCase()} – REGISTRÁCIA ${PAID_PRICE_LABEL}`;

/** Hlavné vysvetlenie cenového režimu aktuálneho kola. */
export const FREE_ROUND_NOTICE = REGISTRATION_FREE
  ? `Iba počas ${CURRENT_MONTH_LOCATIVE} je registrácia psa do súťaže úplne zadarmo. Od ${NEXT_MONTH_GENITIVE} bude registrácia opäť ${PAID_PRICE_LABEL}.`
  : `Registrácia psa do súťaže je jednorazovo ${PAID_PRICE_LABEL}. ${RESERVED_SHARE_TEXT}`;

/** Krátky cenový riadok pod tlačidlami. */
export const PRICE_SWITCH_LINE = REGISTRATION_FREE
  ? `${MONTH_ADJ[MONTH].replace("ová", "")} ${YEAR}: ${FREE_PRICE_LABEL} | Od ${NEXT_MONTH_GENITIVE}: ${PAID_PRICE_LABEL}`
  : `Registrácia: ${PAID_PRICE_LABEL} — 20 % je rezervovaných pre útulky ❤️`;

/** Veta o cene do právnych a informačných textov. */
export const PRICE_TERMS_SENTENCE = REGISTRATION_FREE
  ? `V ${CURRENT_MONTH_LOCATIVE} je registrácia psa ZADARMO. Od ${NEXT_MONTH_GENITIVE} je registrácia ${PAID_PRICE_LABEL} dobrovoľná podpora projektu a je nevratná, okrem technickej chyby platby.`
  : `Registrácia psa je ${PAID_PRICE_LABEL} — dobrovoľná podpora projektu, nevratná, okrem technickej chyby platby.`;

/** Vysvetlenie mesačného cyklu súťaže. */
export const MONTHLY_CYCLE_TEXT =
  "Súťaž prebieha každý mesiac – každý mesiac začína nové kolo súťaže a každý mesiac môže byť vyhlásený nový víťaz.";

/** Krátky popis cenového režimu pre používateľské texty. */
export const promoNotice = (free: boolean = REGISTRATION_FREE): string =>
  free ? FREE_ROUND_NOTICE : `Registrácia psa je jednorazovo ${PAID_PRICE_LABEL}. ${RESERVED_SHARE_TEXT}`;
