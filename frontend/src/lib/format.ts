import { formatDistanceToNowStrict, format } from "date-fns";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});
const num = new Intl.NumberFormat("en-IN");

export const formatINR = (v: number) => inr.format(v);
export const formatNumber = (v: number) => num.format(v);
export const timeAgo = (iso: string) =>
  formatDistanceToNowStrict(new Date(iso), { addSuffix: true });
export const timeOfDay = (iso: string) => format(new Date(iso), "h:mm a");
export const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
