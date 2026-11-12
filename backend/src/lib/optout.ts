/**
 * Carrier-style opt-out keywords (STOP/START), matched on the first word or
 * the whole normalized message — "STOP!" and "stop now" opt out, but
 * "please stop" does not (the keyword must lead).
 */
const OPT_OUT = new Set(["STOP", "STOPALL", "UNSUBSCRIBE", "CANCEL", "END", "QUIT"]);
const OPT_IN = new Set(["START", "UNSTOP", "SUBSCRIBE"]);

export function detectOptOutKeyword(text: string): "out" | "in" | null {
  const normalized = text
    .trim()
    .toUpperCase()
    .replace(/[^A-Z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!normalized) return null;
  const first = normalized.split(" ")[0]!;
  if (OPT_OUT.has(normalized) || OPT_OUT.has(first)) return "out";
  if (OPT_IN.has(normalized) || OPT_IN.has(first)) return "in";
  return null;
}
