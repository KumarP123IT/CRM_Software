import { subDays, subHours, subMinutes, addHours, addMinutes, startOfDay } from "date-fns";
import type {
  ActivityItem,
  Bot,
  Broadcast,
  CallReminder,
  Contact,
  Conversation,
  Lead,
  Team,
  Template,
  User,
  Workspace,
} from "../types";

const now = new Date();
const iso = (d: Date) => d.toISOString();

export const team: User[] = [
  {
    id: "u1",
    name: "Priya Sharma",
    email: "priya@chaipointcafe.in",
    avatarColor: 0,
    role: "owner",
    online: true,
  },
  {
    id: "u2",
    name: "Rohit Verma",
    email: "rohit@chaipointcafe.in",
    avatarColor: 1,
    role: "manager",
    online: true,
  },
  {
    id: "u3",
    name: "Ananya Iyer",
    email: "ananya@chaipointcafe.in",
    avatarColor: 2,
    role: "agent",
    online: false,
  },
  {
    id: "u4",
    name: "Farhan Qureshi",
    email: "farhan@chaipointcafe.in",
    avatarColor: 3,
    role: "agent",
    online: true,
  },
];

export const workspaces: Workspace[] = [
  { id: "w1", name: "Chai Point Café", plan: "Growth", city: "Bengaluru" },
  { id: "w2", name: "Mehta Electronics", plan: "Starter", city: "Ahmedabad" },
  { id: "w3", name: "Lotus Ayurveda", plan: "Pro", city: "Kochi" },
];

const firstNames = [
  "Aarav",
  "Vivaan",
  "Aditya",
  "Ishaan",
  "Kabir",
  "Reyansh",
  "Arjun",
  "Sai",
  "Krishna",
  "Ayaan",
  "Diya",
  "Saanvi",
  "Aadhya",
  "Kiara",
  "Myra",
  "Anika",
  "Pari",
  "Navya",
  "Meera",
  "Riya",
  "Harsh",
  "Neha",
  "Pooja",
  "Rahul",
  "Sneha",
  "Vikram",
  "Kavya",
  "Tanvi",
  "Nikhil",
  "Siddharth",
  "Lakshmi",
  "Gaurav",
  "Divya",
  "Manish",
  "Shreya",
  "Yash",
  "Zoya",
  "Imran",
  "Deepika",
  "Arnav",
];
const lastNames = [
  "Patel",
  "Reddy",
  "Nair",
  "Gupta",
  "Singh",
  "Kumar",
  "Joshi",
  "Menon",
  "Das",
  "Kapoor",
  "Bose",
  "Shetty",
  "Chopra",
  "Pillai",
  "Rao",
  "Khan",
  "Agarwal",
  "Mishra",
  "Banerjee",
  "Desai",
];
const cities = [
  "Mumbai",
  "Bengaluru",
  "Delhi",
  "Pune",
  "Hyderabad",
  "Chennai",
  "Jaipur",
  "Kolkata",
  "Ahmedabad",
  "Kochi",
  "Indore",
  "Lucknow",
];
const tagPool = [
  "VIP",
  "Repeat buyer",
  "Diwali offer",
  "Wholesale",
  "New",
  "Cold",
  "Catering",
  "Feedback",
];

function seeded(i: number) {
  const x = Math.sin(i * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

export const contacts: Contact[] = firstNames.map((fn, i) => {
  const ln = lastNames[i % lastNames.length]!;
  const r = seeded(i + 1);
  const phoneTail = String(Math.floor(70000 + r * 29999)).padStart(5, "0");
  return {
    id: `c${i + 1}`,
    name: `${fn} ${ln}`,
    phone: `+91 9${String(8 + (i % 2))}${String(100 + i * 7).slice(-3)} ${phoneTail}`,
    email: i % 3 === 0 ? `${fn.toLowerCase()}.${ln.toLowerCase()}@gmail.com` : undefined,
    city: cities[i % cities.length]!,
    tags: [
      tagPool[i % tagPool.length]!,
      ...(i % 4 === 0 ? [tagPool[(i + 3) % tagPool.length]!] : []),
    ],
    optedIn: i % 7 !== 0,
    lifetimeValue: Math.round(r * 48000 + 500),
    lastSeenAt: iso(subHours(now, Math.floor(r * 200))),
    createdAt: iso(subDays(now, Math.floor(r * 120) + 1)),
    customFields: [
      { label: "Preferred store", value: cities[i % cities.length]! },
      { label: "GST invoice", value: i % 2 === 0 ? "Yes" : "No" },
    ],
    notes: i % 5 === 0 ? "Prefers extra ginger in cutting chai." : "",
  };
});

const convoSeeds: Array<
  [number, string, Conversation["status"], string | undefined, number, number]
> = [
  [
    0,
    "Bhaiya, kal ke liye 40 cutting chai ka order ho jayega? Office meeting hai.",
    "open",
    "u1",
    2,
    4,
  ],
  [1, "Is the masala chai premix available in 1kg pack?", "open", "u3", 1, 12],
  [2, "Thank you! Delivery mil gayi, sab kuch perfect tha 🙏", "resolved", "u2", 0, 40],
  [3, "Can you share the catering menu for 120 people?", "open", "u1", 3, 22],
  [4, "Payment ho gaya UPI pe, please confirm.", "pending", "u4", 1, 55],
  [5, "Do you deliver to Whitefield on Sundays?", "open", undefined, 1, 70],
  [6, "Order #4821 abhi tak nahi aaya, 45 min ho gaye.", "open", "u1", 2, 95],
  [7, "Diwali gift hampers ka price list bhej do please.", "pending", "u2", 0, 130],
  [8, "Loved the new cardamom cookies. Bulk discount?", "open", "u3", 1, 190],
  [9, "Please cancel my subscription from next month.", "pending", "u1", 0, 260],
  [10, "Can I change the delivery address to Koramangala?", "resolved", "u4", 0, 400],
  [11, "Hi, saw your Instagram ad — what's the combo offer?", "open", undefined, 1, 600],
];

const channels: Conversation["channel"][] = [
  "whatsapp",
  "whatsapp",
  "whatsapp",
  "instagram",
  "web",
];

export const conversations: Conversation[] = convoSeeds.map(
  ([ci, msg, status, assignee, unread, mins], i) => ({
    id: `cv${i + 1}`,
    contactId: contacts[ci]!.id,
    contactName: contacts[ci]!.name,
    assigneeId: assignee,
    teamId: i % 4 === 0 ? "tm2" : "tm1",
    status,
    unread,
    lastMessage: msg,
    lastMessageAt: iso(subMinutes(now, mins)),
    tags: contacts[ci]!.tags.slice(0, 1),
    channel: channels[i % channels.length]!,
    slaDueAt:
      status === "open" && i % 3 === 0
        ? iso(i === 0 ? addMinutes(now, 8) : subMinutes(now, 6))
        : undefined,
    windowClosesAt: iso(i === 11 ? subHours(now, 2) : addHours(now, 18 - (i % 16))),
  }),
);

export const teams: Team[] = [
  { id: "tm1", name: "Front of house" },
  { id: "tm2", name: "Catering" },
  { id: "tm3", name: "Wholesale" },
];

export const quickReplies = [
  {
    id: "qr1",
    shortcut: "menu",
    body: "Here's today's menu: Cutting chai ₹20, Masala ₹35, Ginger ₹30. Cookies from ₹40.",
  },
  {
    id: "qr2",
    shortcut: "hours",
    body: "We're open 7am–10pm every day, including Sundays.",
  },
  {
    id: "qr3",
    shortcut: "thanks",
    body: "Thank you for choosing Chai Point Café! ☕",
  },
  {
    id: "qr4",
    shortcut: "delay",
    body: "Sorry for the wait — your order is on the way. We'll message you when the rider is close.",
  },
];

export const templates: Template[] = [
  {
    id: "t1",
    name: "order_confirmation",
    category: "Utility",
    language: "en",
    status: "approved",
    body: "Hi {{1}}, your order #{{2}} is confirmed and will reach you by {{3}}. Thank you for choosing Chai Point Café!",
  },
  {
    id: "t2",
    name: "diwali_offer_2026",
    category: "Marketing",
    language: "hi-en",
    status: "approved",
    body: "Namaste {{1}}! 🪔 Is Diwali, get 20% off on all gift hampers. Use code DIYA20. Valid till 12 Nov.",
  },
  {
    id: "t3",
    name: "payment_reminder",
    category: "Utility",
    language: "en",
    status: "pending",
    body: "Hi {{1}}, a gentle reminder that ₹{{2}} is due for invoice {{3}}. Pay here: {{4}}",
  },
  {
    id: "t4",
    name: "login_otp",
    category: "Authentication",
    language: "en",
    status: "approved",
    body: "{{1}} is your verification code. Do not share it with anyone.",
  },
  {
    id: "t5",
    name: "feedback_request",
    category: "Marketing",
    language: "hi-en",
    status: "rejected",
    body: "Hi {{1}}, aapka experience kaisa raha? Reply with 1–5 ⭐",
  },
];

export const broadcasts: Broadcast[] = [
  {
    id: "b1",
    name: "Diwali hampers — VIPs",
    templateId: "t2",
    audience: "VIP",
    status: "sent",
    sent: 842,
    delivered: 821,
    read: 690,
  },
  {
    id: "b2",
    name: "Monsoon chai combo",
    templateId: "t2",
    audience: "Repeat buyer",
    status: "scheduled",
    sent: 0,
    delivered: 0,
    read: 0,
    scheduledAt: iso(addHours(now, 20)),
  },
  {
    id: "b3",
    name: "Payment reminders — Oct",
    templateId: "t3",
    audience: "Wholesale",
    status: "draft",
    sent: 0,
    delivered: 0,
    read: 0,
  },
];

export const leads: Lead[] = [
  {
    id: "l1",
    contactId: "c4",
    title: "Corporate catering — 120 pax",
    value: 54000,
    stage: "proposal",
    ownerId: "u1",
    updatedAt: iso(subHours(now, 3)),
  },
  {
    id: "l2",
    contactId: "c8",
    title: "Diwali hampers × 60",
    value: 72000,
    stage: "qualified",
    ownerId: "u2",
    updatedAt: iso(subHours(now, 7)),
  },
  {
    id: "l3",
    contactId: "c12",
    title: "Monthly office chai supply",
    value: 18500,
    stage: "contacted",
    ownerId: "u1",
    updatedAt: iso(subHours(now, 26)),
  },
  {
    id: "l4",
    contactId: "c15",
    title: "Wedding sangeet tea stall",
    value: 35000,
    stage: "new",
    ownerId: "u4",
    updatedAt: iso(subHours(now, 1)),
  },
  {
    id: "l5",
    contactId: "c19",
    title: "Café franchise enquiry",
    value: 250000,
    stage: "new",
    ownerId: "u2",
    updatedAt: iso(subHours(now, 2)),
  },
  {
    id: "l6",
    contactId: "c21",
    title: "Cookies bulk order",
    value: 9600,
    stage: "won",
    ownerId: "u3",
    updatedAt: iso(subDays(now, 2)),
  },
  {
    id: "l7",
    contactId: "c25",
    title: "College fest sponsorship",
    value: 15000,
    stage: "lost",
    ownerId: "u4",
    updatedAt: iso(subDays(now, 4)),
  },
  {
    id: "l8",
    contactId: "c30",
    title: "Premix distributorship — Pune",
    value: 120000,
    stage: "qualified",
    ownerId: "u1",
    updatedAt: iso(subHours(now, 12)),
  },
];

export const bots: Bot[] = [
  {
    id: "bt1",
    name: "Welcome & menu",
    trigger: {
      type: "first_message",
      response: "Hi! Thanks for reaching out — here's our menu: …",
    },
    active: true,
    runs: 1284,
  },
  {
    id: "bt2",
    name: "Order status lookup",
    trigger: {
      type: "keyword",
      keywords: ["status", "order", "track"],
      response: "You can check your order status in the app under Orders.",
    },
    active: true,
    runs: 532,
  },
  {
    id: "bt3",
    name: "After-hours reply",
    trigger: {
      type: "outside_hours",
      response: "We're offline right now — leave a message and we'll reply soon.",
    },
    active: false,
    runs: 211,
  },
];

const today = startOfDay(now);
export const callReminders: CallReminder[] = [
  {
    id: "cr1",
    contactName: contacts[3]!.name,
    phone: contacts[3]!.phone,
    at: iso(addHours(today, 11)),
    note: "Walk through catering proposal",
  },
  {
    id: "cr2",
    contactName: contacts[29]!.name,
    phone: contacts[29]!.phone,
    at: iso(addMinutes(addHours(today, 15), 30)),
    note: "Discuss distributor margins",
  },
  {
    id: "cr3",
    contactName: contacts[14]!.name,
    phone: contacts[14]!.phone,
    at: iso(addHours(today, 18)),
    note: "Confirm sangeet date & stall size",
  },
];

export const activity: ActivityItem[] = [
  {
    id: "a1",
    kind: "lead",
    text: "moved “Corporate catering — 120 pax” to Proposal",
    at: iso(subMinutes(now, 8)),
    actorName: "Priya Sharma",
  },
  {
    id: "a2",
    kind: "assignment",
    text: "assigned Kiara Kumar's chat to Ananya",
    at: iso(subMinutes(now, 21)),
    actorName: "Rohit Verma",
  },
  {
    id: "a3",
    kind: "broadcast",
    text: "sent “Diwali hampers — VIPs” to 842 people",
    at: iso(subHours(now, 2)),
    actorName: "Priya Sharma",
  },
  {
    id: "a4",
    kind: "contact",
    text: "imported 126 contacts from Excel",
    at: iso(subHours(now, 5)),
    actorName: "Farhan Qureshi",
  },
  {
    id: "a5",
    kind: "message",
    text: "resolved the chat with Aditya Nair",
    at: iso(subHours(now, 6)),
    actorName: "Rohit Verma",
  },
];
