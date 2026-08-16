// Centralizované ceny registrácie psa do súťaže.
// Počas prebiehajúcej súťaže je registrácia ZADARMO.
// Po ukončení aktuálnej súťaže sa cena automaticky nastaví na 1,99 €.

export const PAID_PRICE_CENTS = 199;
export const PAID_PRICE_LABEL = "1,99 €";

/**
 * Vráti cenový popis podľa toho, či práve prebieha súťaž.
 * @param contestActive – true, ak je aktuálna súťaž aktívna (končí v budúcnosti).
 */
export const registrationPriceLabel = (contestActive: boolean): string =>
  contestActive ? "ZADARMO" : PAID_PRICE_LABEL;

/** Krátky popis cenového režimu pre používateľské texty. */
export const promoNotice = (contestActive: boolean): string =>
  contestActive
    ? `Počas prebiehajúcej súťaže je registrácia psa ZADARMO. Po ukončení súťaže bude poplatok automaticky ${PAID_PRICE_LABEL}.`
    : `Registrácia psa je jednorazovo ${PAID_PRICE_LABEL}. ${RESERVED_SHARE_TEXT}`;

/** Jednotný text o rozdelení podpory 20 / 80. */
export const RESERVED_SHARE_TEXT =
  "20 % z každej úspešnej registrácie je REZERVOVANÝCH pre spolupracujúce útulky. 80 % ide na prevádzku stránky, vývoj, Stripe poplatky a ceny. Organizátorovi nejde priamy zisk.";

/**
 * Globálny prepínač: registrácia psa je platená (súťaž s promo akciou sa skončila).
 * Typ je zámerne `boolean`, aby UI vetvenie zostalo funkčné.
 */
export const REGISTRATION_FREE: boolean = false;
