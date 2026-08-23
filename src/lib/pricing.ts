// Centralizované ceny registrácie psa do súťaže.
// Súťaž prebieha KAŽDÝ MESIAC – každé kolo má vlastný názov a vlastný cenník.
//
// Ako vypnúť augustovú akciu pre septembrové kolo:
//   1) nastav REGISTRATION_FREE = false
//   2) prepíš ROUND_LABEL na "Septembrová súťaž 2026"
// Nič iné netreba – všetky texty na webe sa riadia týmito konštantami.

export const PAID_PRICE_CENTS = 199;
export const PAID_PRICE_LABEL = "1,99 €";
export const FREE_PRICE_LABEL = "0 €";

/**
 * Globálny prepínač: registrácia psa je počas augustového kola ZADARMO.
 * Pre septembrové kolo nastav na `false` a cena sa všade vráti na 1,99 €.
 */
export const REGISTRATION_FREE: boolean = true;

/** Aktuálne kolo súťaže (súťaž sa koná každý mesiac). */
export const ROUND_LABEL = "Augustová súťaž 2026";

/** Krátky nadpis akcie. */
export const FREE_ROUND_TITLE = "🐶 AUGUSTOVÁ SÚŤAŽ – REGISTRÁCIA ZADARMO!";

/** Hlavné vysvetlenie akcie. */
export const FREE_ROUND_NOTICE =
  "Iba počas augusta 2026 je registrácia psa do súťaže úplne zadarmo. Od septembra 2026 bude registrácia opäť 1,99 €.";

/** Krátky cenový riadok pod tlačidlami. */
export const PRICE_SWITCH_LINE = "August 2026: 0 € | Od septembra: 1,99 €";

/** Vysvetlenie mesačného cyklu súťaže. */
export const MONTHLY_CYCLE_TEXT =
  "Súťaž prebieha každý mesiac – každý mesiac začína nové kolo súťaže a každý mesiac môže byť vyhlásený nový víťaz.";

/** Jednotný text o rozdelení podpory 20 / 80. */
export const RESERVED_SHARE_TEXT =
  "20 % z každej úspešnej registrácie je REZERVOVANÝCH pre spolupracujúce útulky. 80 % ide na prevádzku stránky, vývoj, Stripe poplatky a ceny. Organizátorovi nejde priamy zisk.";

/** Aktuálna cena registrácie ako text. */
export const registrationPriceLabel = (free: boolean = REGISTRATION_FREE): string =>
  free ? FREE_PRICE_LABEL : PAID_PRICE_LABEL;

/** Krátky popis cenového režimu pre používateľské texty. */
export const promoNotice = (free: boolean = REGISTRATION_FREE): string =>
  free ? FREE_ROUND_NOTICE : `Registrácia psa je jednorazovo ${PAID_PRICE_LABEL}. ${RESERVED_SHARE_TEXT}`;
