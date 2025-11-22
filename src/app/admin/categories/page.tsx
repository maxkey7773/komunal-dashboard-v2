import Shell from "@/components/shell";
import { prisma } from "@/lib/prisma";
import { Card, Button, Input, Label, Select, Hr, GhostButton } from "@/components/ui";
import { revalidatePath } from "next/cache";

export default async function CategoriesPage() {
  const categories = await prisma.expenseCategory.findMany({ orderBy: { createdAt: "desc" } });

  async function createAction(formData: FormData) {
    "use server";
    const name = String(formData.get("name"));
    const unit = String(formData.get("unit") || "");
    const isUtility = Boolean(formData.get("isUtility"));
    await prisma.expenseCategory.create({ data: { name, unit, isUtility } });
    revalidatePath("/admin/categories");
  }

  async function deleteAction(formData: FormData) {
    "use server";
    const id = String(formData.get("id"));
    await prisma.expenseCategory.delete({ where: { id } });
    revalidatePath("/admin/categories");
  }

  return (
    <Shell admin>
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1 h-fit">
          <div className="text-lg font-semibold">Yangi harajat turi</div>
          <Hr />
          <form action={createAction} className="space-y-3">
            <div>
              <Label>Nomi</Label>
              <Input name="name" required />
            </div>
            <div>
              <Label>Birlik (ixtiyoriy)</Label>
              <Input name="unit" placeholder="m3, kWh, oy..." />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isUtility" /> Kommunal turimi?
            </label>
            <Button className="w-full" type="submit">Saqlash</Button>
          </form>
        </Card>

        <Card className="lg:col-span-2">
          <div className="text-lg font-semibold">Harajat turlari</div>
          <Hr />
          <div className="space-y-2">
            {categories.map(c => (
              <div key={c.id} className="card p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-slate-500">{c.isUtility ? "Kommunal" : "Oddiy"} • {c.unit || "-"}</div>
                </div>
                <form action={deleteAction}>
                  <input type="hidden" name="id" value={c.id} />
                  <GhostButton type="submit">O'chirish</GhostButton>
                </form>
              </div>
            ))}
            {categories.length === 0 && <div className="text-slate-500 text-center py-6">Turlar yo'q</div>}
          </div>
        </Card>
      </div>
    </Shell>
  );
}
