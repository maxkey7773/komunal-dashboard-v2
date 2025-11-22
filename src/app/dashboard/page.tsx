import Shell from "@/components/shell";
import { Card, CardTitle, CardValue, Hr } from "@/components/ui";
import { getDashboardData } from "@/lib/dashboard";
import Charts from "./charts";
import DashboardFilters from "./filters";
import { startOfWeek, startOfMonth, startOfYear } from "date-fns";

export default async function DashboardPage({ searchParams }: { searchParams: any }) {
  const range = searchParams?.range || "month";
  const now = new Date();

  let from: Date | undefined;
  let to: Date | undefined;

  if (range === "week") from = startOfWeek(now);
  if (range === "month") from = startOfMonth(now);
  if (range === "year") from = startOfYear(now);
  if (range === "custom") {
    if (searchParams?.from) from = new Date(searchParams.from);
    if (searchParams?.to) to = new Date(searchParams.to);
  }

  const data = await getDashboardData({
    objectId: searchParams?.objectId || undefined,
    categoryId: searchParams?.categoryId || undefined,
    from,
    to
  });

  return (
    <Shell>
      <div className="space-y-6">
        <DashboardFilters objects={data.objects} categories={data.categories} />

        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card><CardTitle>Haftalik jami</CardTitle><CardValue>{Number(data.kpis.week).toLocaleString()} so'm</CardValue></Card>
          <Card><CardTitle>Oylik jami</CardTitle><CardValue>{Number(data.kpis.month).toLocaleString()} so'm</CardValue></Card>
          <Card><CardTitle>Yillik jami</CardTitle><CardValue>{Number(data.kpis.year).toLocaleString()} so'm</CardValue></Card>
          <Card><CardTitle>Jami qarz</CardTitle><CardValue>{Number(data.kpis.debt).toLocaleString()} so'm</CardValue></Card>
          <Card><CardTitle>30 kun ichida to'lov</CardTitle><CardValue>{Number(data.kpis.dueSoon).toLocaleString()} so'm</CardValue></Card>
          <Card><CardTitle>Overdue soni</CardTitle><CardValue>{data.kpis.overdueCount}</CardValue></Card>
        </div>

        <Charts byCategory={data.byCategory} byObject={data.byObject} />

        <Card>
          <div className="text-lg font-semibold">Haqdorliklar</div>
          <Hr />
          <DebtTable />
        </Card>
      </div>
    </Shell>
  );
}

async function DebtTable() {
  const { prisma } = await import("@/lib/prisma");
  const debts = await prisma.expense.findMany({
    where: { debtAmount: { gt: 0 } },
    include: { object: true, category: true },
    orderBy: { debtDueDate: "asc" }
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-slate-400">
          <tr>
            <th className="text-left py-2">Obyekt</th>
            <th className="text-left py-2">Harajat turi</th>
            <th className="text-right py-2">Qarz</th>
            <th className="text-left py-2">Muddat</th>
            <th className="text-left py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {debts.map(d => (
            <tr key={d.id} className="border-t border-slate-800">
              <td className="py-2">{d.object.name}</td>
              <td className="py-2">{d.category.name}</td>
              <td className="py-2 text-right">{Number(d.debtAmount).toLocaleString()} so'm</td>
              <td className="py-2">{d.debtDueDate ? new Date(d.debtDueDate).toLocaleDateString() : "-"}</td>
              <td className="py-2">
                <span className="badge bg-amber-500/20 text-amber-200">{d.status}</span>
              </td>
            </tr>
          ))}
          {debts.length === 0 && (
            <tr><td colSpan={5} className="py-6 text-center text-slate-500">Qarz yo'q</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
