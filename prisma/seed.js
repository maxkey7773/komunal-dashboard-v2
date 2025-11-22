const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // categories
  const categories = [
    { name: "Gaz", unit: "m3", isUtility: true },
    { name: "Suv", unit: "m3", isUtility: true },
    { name: "Svet", unit: "kWh", isUtility: true },
    { name: "Internet", unit: "oy", isUtility: true },
    { name: "Jarima", unit: "sum", isUtility: false },
    { name: "Remont", unit: "sum", isUtility: false },
    { name: "Avto yoqilg'i", unit: "litr", isUtility: false }
  ];
  for (const c of categories) {
    await prisma.expenseCategory.upsert({
      where: { name: c.name },
      update: {},
      create: c
    });
  }

  // admin user from env
  const adminUsername = process.env.ADMIN_USERNAME || "admin";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const hashed = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { username: adminUsername },
    update: { password: hashed, role: "ADMIN", fullName: "Admin" },
    create: {
      username: adminUsername,
      password: hashed,
      role: "ADMIN",
      fullName: "Admin"
    }
  });

  console.log("Seed done.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
