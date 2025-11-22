import Shell from "@/components/shell";
import { Card, CardTitle, CardValue, Hr, Button, Input, Label, Select } from "@/components/ui";
import { getDashboardData } from "@/lib/dashboard";
import Charts from "@/app/dashboard/charts";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function AdminDashboardPage() {
  const data = await getDashboardData();

  return (
    <Shell admin>
      <div className="space-y-6">
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
          <div className="text-lg font-semibold">Haqdorliklar (so'ndirish)</div>
          <Hr />
          <DebtSettleTable />
        </Card>
      </div>
    </Shell>
  );
}

async function DebtSettleTable() {
  const debts = await prisma.expense.findMany({
    where: { debtAmount: { gt: 0 } },
    include: { object: true, category: true },
    orderBy: { debtDueDate: "asc" }
  });
  const tariffs = await prisma.tariff.findMany({ orderBy: { validFrom: "desc" } });
  const tariffMap = new Map(tariffs.map(t => [t.categoryId, t.pricePerUnit]));

  async function settleAction(formData: FormData) {
    "use server";
    const expenseId = String(formData.get("expenseId"));
    const quantity = Number(formData.get("quantity") || 0);
    const pricePerUnit = Number(formData.get("pricePerUnit") || 0);

    const expense = await prisma.expense.findUnique({ where: { id: expenseId } });
    if (!expense) return;

    const total = quantity * pricePerUnit;

    await prisma.meterRead.create({
      data: {
        expenseId,
        quantity,
        pricePerUnit,
        totalPrice: total
      }
    });
    await prisma.payment.create({ data: { expenseId, amount: total } });

    if (total >= Number(expense.debtAmount)) {
      const remain = total - Number(expense.debtAmount);
      await prisma.expense.update({
        where: { id: expenseId },
        data: {
          debtAmount: 0,
          prepaidAmount: Number(expense.prepaidAmount) + remain,
          status: "PAID"
        }
      });
    } else {
      await prisma.expense.update({
        where: { id: expenseId },
        data: {
          debtAmount: Number(expense.debtAmount) - total,
          status: "PARTIAL"
        }
      });
    }

    revalidatePath("/admin/dashboard");
  }

  return (
    <div className="space-y-3">
      {debts.map(d => (
        <form key={d.id} action={settleAction} className="card p-3 grid md:grid-cols-6 gap-2 items-end">
          <input type="hidden" name="expenseId" value={d.id} />
          <div className="md:col-span-2">
            <div className="text-sm text-slate-400">Obyekt / Turi</div>
            <div className="font-medium">{d.object.name} — {d.category.name}</div>
            <div className="text-xs text-slate-500">Qarz: {Number(d.debtAmount).toLocaleString()} so'm</div>
          </div>

          <div>
            <Label>Miqdor ({d.category.unit || "birlik"})</Label>
            <Input name="quantity" type="number" step="0.001" required />
          </div>

          <div>
            <Label>Tarif (1 birlik)</Label>
            <Input name="pricePerUnit" type="number" step="0.0001"
              defaultValue={Number(tariffMap.get(d.categoryId) || 0)} required />
          </div>

          <div className="md:col-span-2 flex gap-2">
            <Button type="submit">So'ndirish</Button>
          </div>
        </form>
      ))}
      {debts.length === 0 && (
        <div className="text-center text-slate-500 py-6">Qarz yo'q</div>
      )}
    </div>
  );
}
