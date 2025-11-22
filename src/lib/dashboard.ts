import { prisma } from "./prisma";
import { startOfWeek, startOfMonth, startOfYear } from "date-fns";

export async function getDashboardData(filters?: { objectId?: string; categoryId?: string; from?: Date; to?: Date }) {
  const now = new Date();
  const from = filters?.from;
  const to = filters?.to;

  const where: any = {};
  if (filters?.objectId) where.objectId = filters.objectId;
  if (filters?.categoryId) where.categoryId = filters.categoryId;
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = from;
    if (to) where.createdAt.lte = to;
  }

  const [weekSum, monthSum, yearSum, totalDebt, dueSoon, overdueCount, byCategory, byObject] = await Promise.all([
    prisma.expense.aggregate({ where: { ...where, createdAt: { gte: startOfWeek(now) } }, _sum: { amount: true } }),
    prisma.expense.aggregate({ where: { ...where, createdAt: { gte: startOfMonth(now) } }, _sum: { amount: true } }),
    prisma.expense.aggregate({ where: { ...where, createdAt: { gte: startOfYear(now) } }, _sum: { amount: true } }),
    prisma.expense.aggregate({ where: { ...where, debtAmount: { gt: 0 } }, _sum: { debtAmount: true } }),
    prisma.expense.aggregate({ where: { ...where, dueDate: { lte: new Date(now.getTime() + 1000*60*60*24*30) }, status: { in: ["DUE","PARTIAL"] } }, _sum: { debtAmount: true } }),
    prisma.expense.count({ where: { ...where, status: "OVERDUE" } }),
    prisma.expense.groupBy({ by: ["categoryId"], where, _sum: { amount: true } }),
    prisma.expense.groupBy({ by: ["objectId"], where, _sum: { amount: true } })
  ]);

  const categories = await prisma.expenseCategory.findMany();
  const objects = await prisma.object.findMany();

  const catMap = new Map(categories.map(c => [c.id, c.name]));
  const objMap = new Map(objects.map(o => [o.id, o.name]));

  return {
    kpis: {
      week: weekSum._sum.amount ?? 0,
      month: monthSum._sum.amount ?? 0,
      year: yearSum._sum.amount ?? 0,
      debt: totalDebt._sum.debtAmount ?? 0,
      dueSoon: dueSoon._sum.debtAmount ?? 0,
      overdueCount
    },
    byCategory: byCategory.map(x => ({ name: catMap.get(x.categoryId) || "?", value: x._sum.amount ?? 0 })),
    byObject: byObject.map(x => ({ name: objMap.get(x.objectId) || "?", value: x._sum.amount ?? 0 })),
    categories,
    objects
  };
}
