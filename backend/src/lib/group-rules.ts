export interface GroupRule {
  field: string;
  operator: string;
  value: string;
  logic?: "AND" | "OR";
}

interface Evaluable {
  name: string | null;
  phone: string;
  email: string | null;
  city: string | null;
  company: string | null;
  source: string;
  optedOut: boolean;
  lifetimeValue: unknown; // Decimal | number | string
  lastSeenAt: Date;
  tags: string[];
}

function fieldValue(c: Evaluable, field: string): string {
  switch (field) {
    case "name":
      return c.name ?? "";
    case "phone":
      return c.phone;
    case "email":
      return c.email ?? "";
    case "city":
      return c.city ?? "";
    case "company":
      return c.company ?? "";
    case "source":
      return c.source;
    case "tags":
      return c.tags.join(",");
    case "optedIn":
      return c.optedOut ? "false" : "true";
    case "optedOut":
      return String(c.optedOut);
    case "lifetimeValue":
      return String(c.lifetimeValue ?? 0);
    case "lastSeen":
      return c.lastSeenAt.toISOString();
    default:
      return "";
  }
}

function evalRule(c: Evaluable, rule: GroupRule): boolean {
  const actual = fieldValue(c, rule.field);
  const expected = rule.value ?? "";
  const a = actual.toLowerCase();
  const e = expected.toLowerCase();
  switch (rule.operator) {
    case "equals":
      return a === e;
    case "not_equals":
      return a !== e;
    case "contains":
      return a.includes(e);
    case "not_contains":
      return !a.includes(e);
    case "greater_than":
      return Number(actual) > Number(expected);
    case "less_than":
      return Number(actual) < Number(expected);
    case "is_empty":
      return actual.trim() === "";
    case "is_not_empty":
      return actual.trim() !== "";
    default:
      return false;
  }
}

/** Evaluate dynamic-group rules. Empty rules → matches nothing (safe default). */
export function matchesRules(c: Evaluable, rules: GroupRule[]): boolean {
  if (!rules.length) return false;
  let result = evalRule(c, rules[0]!);
  for (const rule of rules.slice(1)) {
    result = rule.logic === "OR" ? result || evalRule(c, rule) : result && evalRule(c, rule);
  }
  return result;
}
