/**
 * Normalize a phone number to E.164-ish form (+<countrycode><number>).
 * India-first: 10-digit mobiles starting 6-9 get +91; 12-digit starting 91 get +.
 * Returns null when the input can't be normalized.
 */
export function normalizePhone(raw: string, defaultCountry = "IN"): string | null {
  let p = raw.trim().replace(/[\s\-()]/g, "");
  if (!p) return null;

  if (p.startsWith("00")) p = `+${p.slice(2)}`;

  if (/^\d+$/.test(p)) {
    if (defaultCountry === "IN") {
      if (p.length === 10 && /^[6-9]/.test(p)) return `+91${p}`;
      if (p.length === 11 && p.startsWith("0")) return `+91${p.slice(1)}`;
      if (p.length === 12 && p.startsWith("91")) return `+${p}`;
    }
    if (p.length >= 11 && p.length <= 15) return `+${p}`;
    return null;
  }
  if (/^\+\d{8,15}$/.test(p)) return p;
  return null;
}
