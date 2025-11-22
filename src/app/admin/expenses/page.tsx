import Shell from "@/components/shell";
import { prisma } from "@/lib/prisma";
import { Card, Button, Input, Label, Select, Hr, GhostButton } from "@/components/ui";
import { revalidatePath } from "next/cache";

export default async function ExpensesPage() {
  const [expenses, objects, categories] = await Promise.all([
    prisma.expense.findMany({ include: { object: true, category: true }, orderBy: { createdAt: "desc" } }),
    prisma.object.findMany({ orderBy: { name: "asc" } }),
    prisma.expenseCategory.findMany({ orderBy: { name: "asc" } })
  ]);

  async function createAction(formData: FormData) {
    "use server";
    const objectId = String(formData.get("objectId"));
    const categoryId = String(formData.get("categoryId"));
    const title = String(formData.get("title") || "");
    const amount = Number(formData.get("amount") || 0);
    const prepaidAmount = Number(formData.get("prepaidAmount") || 0);
    const debtAmount = Number(formData.get("debtAmount") || 0);
    const dueDateRaw = String(formData.get("dueDate") || "");
    const debtDueDateRaw = String(formData.get("debtDueDate") || "");
    const period = String(formData.get("period")) as any;

    await prisma.expense.create({
      data: {
        objectId,
        categoryId,
        title,
        amount,
        prepaidAmount,
        debtAmount,
        dueDate: dueDateRaw ? new Date(dueDateRaw) : null,
        debtDueDate: debtDueDateRaw ? new Date(debtDueDateRaw) : null,
        period,
        status: debtAmount > 0 ? "DUE" : "PAID"
      }
    });
    revalidatePath("/admin/expenses");
  }

  async function deleteAction(formData: FormData) {
    "use server";
    const id = String(formData.get("id"));
    await prisma.expense.delete({ where: { id } });
    revalidatePath("/admin/expenses");
  }

  return (
    <Shell admin>
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1 h-fit">
          <div className="text-lg font-semibold">Yangi harajat</div>
          <Hr />
          <form action={createAction} className="space-y-3">
            <div>
              <Label>Obyekt</Label>
              <Select name="objectId">
                {objects.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </Select>
            </div>
            <div>
              <Label>Harajat turi</Label>
              <Select name="categoryId">
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </div>
            <div>
              <Label>Nomi (ixtiyoriy)</Label>
              <Input name="title" placeholder="Masalan: Noyabr gaz" />
            </div>
            <div>
              <Label>Summa</Label>
              <Input name="amount" type="number" required />
            </div>
            <div>
              <Label>Oldindan to'lov</Label>
              <Input name="prepaidAmount" type="number" defaultValue={0} />
            </div>
            <div>
              <Label>Qarz (haqdorlik)</Label>
              <Input name="debtAmount" type="number" defaultValue={0} />
            </div>
            <div>
              <Label>To'lov muddati</Label>
              <Input name="dueDate" type="date" />
            </div>
            <div>
              <Label>Qarz muddati</Label>
              <Input name="debtDueDate" type="date" />
            </div>
            <div>
              <Label>Period</Label>
              <Select name="period">
                <option value="ONE_TIME">Bir martalik</option>
                <option value="WEEKLY">Haftalik</option>
                <option value="MONTHLY">Oylik</option>
                <option value="YEARLY">Yillik</option>
              </Select>
            </div>
            <Button className="w-full" type="submit">Saqlash</Button>
          </form>
        </Card>

        <Card className="lg:col-span-2">
          <div className="text-lg font-semibold">Harajatlar</div>
          <Hr />
          <div className="space-y-2">
            {expenses.map(e => (
              <div key={e.id} className="card p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {e.object.name} — {e.category.name} {e.title ? `(${e.title})` : ""}
                  </div>
                  <div className="text-xs text-slate-500">
                    {Number(e.amount).toLocaleString()} so'm • qarz: {Number(e.debtAmount).toLocaleString()} •
                    status: {e.status}
                  </div>
                </div>
                <form action={deleteAction}>
                  <input type="hidden" name="id" value={e.id} />
                  <GhostButton type="submit">O'chirish</GhostButton>
                </form>
              </div>
            ))}
            {expenses.length === 0 && <div className="text-slate-500 text-center py-6">Harajat yo'q</div>}
          </div>
        </Card>
      </div>
    </Shell>
  );
}
