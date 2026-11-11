/**
 * Seed script — creates a demo workspace with users across every role,
 * contacts, tags, groups, a team, templates and a broadcast draft.
 * Run: npm run db:seed
 */
import { PrismaClient, type Role } from "@prisma/client";
import "../src/config.js"; // loads .env
import { hashPassword } from "../src/lib/password.js";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "password123";

async function main() {
  const passwordHash = await hashPassword(DEMO_PASSWORD);

  const workspace = await prisma.workspace.upsert({
    where: { slug: "demo" },
    update: {},
    create: { name: "Demo Foods", slug: "demo", plan: "Growth", city: "Bengaluru" },
  });

  const people: { name: string; email: string; role: Role }[] = [
    { name: "Asha Rao", email: "asha@demo.in", role: "owner" },
    { name: "Vikram Shah", email: "vikram@demo.in", role: "admin" },
    { name: "Priya Nair", email: "priya@demo.in", role: "manager" },
    { name: "Rahul Verma", email: "rahul@demo.in", role: "agent" },
    { name: "Sneha Iyer", email: "sneha@demo.in", role: "readonly" },
  ];

  const users = [];
  for (const [i, p] of people.entries()) {
    const user = await prisma.user.upsert({
      where: { email: p.email },
      update: { name: p.name },
      create: { name: p.name, email: p.email, passwordHash, avatarColor: i },
    });
    await prisma.membership.upsert({
      where: { workspaceId_userId: { workspaceId: workspace.id, userId: user.id } },
      update: { role: p.role },
      create: { workspaceId: workspace.id, userId: user.id, role: p.role },
    });
    users.push(user);
  }

  const [salesTeam, supportTeam] = await Promise.all([
    prisma.team.upsert({
      where: { workspaceId_name: { workspaceId: workspace.id, name: "Sales" } },
      update: {},
      create: { workspaceId: workspace.id, name: "Sales" },
    }),
    prisma.team.upsert({
      where: { workspaceId_name: { workspaceId: workspace.id, name: "Support" } },
      update: {},
      create: { workspaceId: workspace.id, name: "Support" },
    }),
  ]);
  void salesTeam;
  void supportTeam;

  const vipTag = await prisma.tag.upsert({
    where: { workspaceId_name: { workspaceId: workspace.id, name: "VIP" } },
    update: {},
    create: { workspaceId: workspace.id, name: "VIP", color: "#f59e0b" },
  });
  const leadTag = await prisma.tag.upsert({
    where: { workspaceId_name: { workspaceId: workspace.id, name: "Lead" } },
    update: {},
    create: { workspaceId: workspace.id, name: "Lead", color: "#3b82f6" },
  });

  const group = await prisma.contactGroup.upsert({
    where: { workspaceId_name: { workspaceId: workspace.id, name: "Regulars" } },
    update: {},
    create: { workspaceId: workspace.id, name: "Regulars" },
  });

  const contactsData = [
    { phone: "+919876543210", name: "Meera Krishnan", email: "meera@example.in", city: "Chennai", company: "Krishna Textiles", source: "whatsapp", optedOut: false },
    { phone: "+919812345678", name: "Arjun Menon", email: "arjun@example.in", city: "Kochi", company: "Backwaters Cafe", source: "import", optedOut: false },
    { phone: "+919845671230", name: "Farhan Ali", city: "Hyderabad", source: "web", optedOut: true },
    { phone: "+919976543210", name: "Divya Sharma", email: "divya@example.in", city: "Pune", company: "Sharma Electronics", source: "referral", optedOut: false },
    { phone: "+919887654321", name: "Karan Patel", city: "Ahmedabad", source: "whatsapp", optedOut: false },
  ];

  for (const c of contactsData) {
    const contact = await prisma.contact.upsert({
      where: { workspaceId_phone: { workspaceId: workspace.id, phone: c.phone } },
      update: { name: c.name, email: c.email, city: c.city },
      create: {
        workspaceId: workspace.id,
        phone: c.phone,
        name: c.name,
        email: c.email,
        city: c.city,
        company: c.company,
        source: c.source,
        optedOut: c.optedOut,
        country: "IN",
      },
    });
    await prisma.contactTag.upsert({
      where: { contactId_tagId: { contactId: contact.id, tagId: leadTag.id } },
      update: {},
      create: { contactId: contact.id, tagId: leadTag.id },
    });
    await prisma.contactGroupMember.upsert({
      where: { groupId_contactId: { groupId: group.id, contactId: contact.id } },
      update: {},
      create: { groupId: group.id, contactId: contact.id },
    });
  }

  const firstContact = await prisma.contact.findFirst({ where: { workspaceId: workspace.id } });
  if (firstContact && users[0]) {
    await prisma.contactTag.upsert({
      where: { contactId_tagId: { contactId: firstContact.id, tagId: vipTag.id } },
      update: {},
      create: { contactId: firstContact.id, tagId: vipTag.id },
    });
    await prisma.lead.upsert({
      where: { id: "seed_lead_1" },
      update: {},
      create: {
        id: "seed_lead_1",
        workspaceId: workspace.id,
        contactId: firstContact.id,
        title: "Bulk order — winter collection",
        value: 125000,
        stage: "qualified",
        ownerId: users[0].id,
      },
    });
  }

  await prisma.template.upsert({
    where: {
      workspaceId_name_language: {
        workspaceId: workspace.id,
        name: "order_confirmation",
        language: "en",
      },
    },
    update: {},
    create: {
      workspaceId: workspace.id,
      name: "order_confirmation",
      category: "Utility",
      language: "en",
      status: "approved",
      body: "Hi {{1}}, your order {{2}} has been confirmed. Total: ₹{{3}}. Track it here: {{4}}",
    },
  });

  await prisma.auditLog.create({
    data: {
      workspaceId: workspace.id,
      userId: users[0]?.id,
      action: "seed.completed",
      meta: { demoPassword: DEMO_PASSWORD },
    },
  });

  console.log(`Seeded workspace "${workspace.name}" (slug: demo).`);
  console.log(`Login: asha@demo.in / ${DEMO_PASSWORD} (owner) — roles: admin, manager, agent, readonly also seeded.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
