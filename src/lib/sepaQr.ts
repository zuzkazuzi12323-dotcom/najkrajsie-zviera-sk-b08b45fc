import QRCode from "qrcode";

/**
 * Build an EPC069-12 (SEPA "pay by QR") payload for bank-transfer QR codes.
 * Scannable by most Slovak/EU banking apps.
 */
export const buildSepaPayload = (opts: {
  iban: string;
  name: string;
  amountCents?: number;
  message?: string;
}) => {
  const iban = opts.iban.replace(/\s+/g, "").toUpperCase();
  const amount =
    opts.amountCents && opts.amountCents > 0
      ? `EUR${(opts.amountCents / 100).toFixed(2)}`
      : "";
  return [
    "BCD",
    "002",
    "1",
    "SCT",
    "",
    opts.name.slice(0, 70),
    iban,
    amount,
    "",
    "",
    (opts.message || "").slice(0, 140),
  ].join("\n");
};

/** Generate a QR code data URL for a SEPA bank transfer. */
export const generateSepaQr = async (opts: {
  iban: string;
  name: string;
  amountCents?: number;
  message?: string;
}): Promise<string> => {
  const payload = buildSepaPayload(opts);
  return QRCode.toDataURL(payload, { margin: 1, width: 260 });
};
