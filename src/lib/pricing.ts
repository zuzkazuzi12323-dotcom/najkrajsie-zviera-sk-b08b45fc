// Centralizované ceny a promo obdobie registrácie psa.
// Do 15. augusta 2026 je registrácia ZADARMO. Od 15. 8. 2026 (00:00 CEST) automaticky 1,99 €.

export const FREE_UNTIL_ISO = "2026-08-15T00:00:00+02:00";
export const FREE_UNTIL_LABEL = "15. augusta 2026";

export const PAID_PRICE_CENTS = 199;
export const PAID_PRICE_LABEL = "1,99 €";

export const isFreeRegistration = (now: Date = new Date()): boolean => {
  return now.getTime() < new Date(FREE_UNTIL_ISO).getTime();
};

export const registrationPriceLabel = (now?: Date): string =>
  isFreeRegistration(now) ? "ZADARMO" : PAID_PRICE_LABEL;

/** Krátky popis promo obdobia pre používateľské texty. */
export const promoNotice = (): string =>
  isFreeRegistration()
    ? `Počas akcie je registrácia psa ZADARMO do ${FREE_UNTIL_LABEL}. Po tomto dátume bude poplatok automaticky ${PAID_PRICE_LABEL}.`
    : `Registrácia psa je jednorazovo ${PAID_PRICE_LABEL}. 20 % z každej registrácie ide útulkom.`;
