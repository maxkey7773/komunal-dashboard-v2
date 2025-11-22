import Shell from "@/components/shell";
import { prisma } from "@/lib/prisma";
import { Card, Button, Input, Label, Select, Hr, GhostButton } from "@/components/ui";
import PurchaseForm from "@/components/purchase-form";
import { revalidatePath } from "next/cache";

export default async function ObjectProfile({ params }: { params: { id: string } }) {
  const object = await prisma.object.findUnique({
    where: { id: params.id },
    include: {
      utilityAccounts: { include: { category: true } },
      inspectors: { include: { category: true } },
      purchases: true
    }
  });
  if (!object) return <div>Not found</div>;

  const categories = await prisma.expenseCategory.findMany({ orderBy: { name: "asc" } });
  const utilityCats = categories.filter(c => c.isUtility);

  async function upsertUtility(formData: FormData) {
    "use server";
    const categoryId = String(formData.get("categoryId"));
    const accountNumber = String(formData.get("accountNumber"));
    await prisma.utilityAccount.upsert({
      where: { objectId_categoryId: { objectId: params.id, categoryId } },
      update: { accountNumber },
      create: { objectId: params.id, categoryId, accountNumber }
    });
    revalidatePath(`/admin/objects/${params.id}`);
  }

  async function upsertInspector(formData: FormData) {
    "use server";
    const categoryId = String(formData.get("categoryId"));
    const inspectorName = String(formData.get("inspectorName"));
    const inspectorPhone = String(formData.get("inspectorPhone"));
    await prisma.inspectorContact.upsert({
      where: { objectId_categoryId: { objectId: params.id, categoryId } },
      update: { inspectorName, inspectorPhone },
      create: { objectId: params.id, categoryId, inspectorName, inspectorPhone }
    });
    revalidatePath(`/admin/objects/${params.id}`);
  }

  async function addPurchase(formData: FormData) {
    "use server";
    const name = String(formData.get("name"));
    const amount = Number(formData.get("amount"));
    const endDateRaw = String(formData.get("endDate") || "");
    const endDate = endDateRaw ? new Date(endDateRaw) : null;
    const note = String(formData.get(\"note\") || \"\");
    const receiptUrl = String(formData.get(\"receiptUrl\") || \"\");
    await prisma.purchase.create({ data: { objectId: params.id, name, amount, endDate, note, receiptUrl: receiptUrl || null } });
    revalidatePath(`/admin/objects/${params.id}`);
  }

  async function deletePurchase(formData: FormData) {
    "use server";
    const id = String(formData.get("purchaseId"));
    await prisma.purchase.delete({ where: { id } });
    revalidatePath(`/admin/objects/${params.id}`);
  }

  const utilMap = new Map(object.utilityAccounts.map(u => [u.categoryId, u.accountNumber]));
  const inspMap = new Map(object.inspectors.map(i => [i.categoryId, i]));

  return (
    <Shell admin>
      <div className="space-y-4">
        <Card>
          <div className="text-xl font-semibold">{object.name}</div>
          <div className="text-sm text-slate-400">{object.type} • {object.address || "-"}</div>
        </Card>

        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <div className="font-semibold">Kommunal ID raqamlari</div>
            <Hr />
            <div className="space-y-2">
              {utilityCats.map(c => (
                <form key={c.id} action={upsertUtility} className="grid grid-cols-5 gap-2 items-end">
                  <input type="hidden" name="categoryId" value={c.id} />
                  <div className="col-span-2">
                    <Label>{c.name} ID</Label>
                    <Input name="accountNumber" defaultValue={utilMap.get(c.id) || ""} placeholder="Abonent raqami" />
                  </div>
                  <div className="col-span-3">
                    <Button type="submit">Saqlash</Button>
                  </div>
                </form>
              ))}
            </div>
          </Card>

          <Card>
            <div className="font-semibold">Inspektorlar</div>
            <Hr />
            <div className="space-y-2">
              {utilityCats.map(c => {
                const i = inspMap.get(c.id);
                return (
                  <form key={c.id} action={upsertInspector} className="grid grid-cols-6 gap-2 items-end">
                    <input type="hidden" name="categoryId" value={c.id} />
                    <div className="col-span-2">
                      <Label>{c.name} inspektori</Label>
                      <Input name="inspectorName" defaultValue={i?.inspectorName || ""} placeholder="Ism" />
                    </div>
                    <div className="col-span-2">
                      <Label>Telefon</Label>
                      <Input name="inspectorPhone" defaultValue={i?.inspectorPhone || ""} placeholder="+998..." />
                    </div>
                    <div className="col-span-2">
                      <Button type="submit">Saqlash</Button>
                    </div>
                  </form>
                );
              })}
            </div>
          </Card>
        </div>

        <Card>
          <div className="font-semibold">Sotib olingan narsalar / aktivlar</div>
          <Hr />
          <form action={addPurchase} className="grid md:grid-cols-5 gap-2 items-end">
            <div className="md:col-span-2">
              <Label>Nomi</Label>
              <Input name="name" required />
            </div>
            <div>
              <Label>Summa</Label>
              <Input name="amount" type="number" required />
            </div>
            <div>
              <Label>Tugash muddati</Label>
              <Input name="endDate" type="date" />
            </div>
            <div>
              <Label>Izoh</Label>
              <Input name="note" />
            </div>
            <div className="md:col-span-5">
              <Button type="submit">Qo'shish</Button>
            </div>
          </form>

          <Hr />
          <div className="space-y-2">
            {object.purchases.map(p => (
              <div key={p.id} className=\"card p-3 flex items-center justify-between gap-3\">
                <div>
                  <div className=\"font-medium\">{p.name}</div>
                  {p.receiptUrl && (
                    <a href={p.receiptUrl} target=\"_blank\" className=\"text-xs text-sky-300 underline\">Chekni ko'rish</a>
                  )}
                  <div className="text-xs text-slate-500">
                    {Number(p.amount).toLocaleString()} so'm •
                    {p.endDate ? " tugash: " + new Date(p.endDate).toLocaleDateString() : " muddatsiz"} •
                    {p.note || "-"}
                  </div>
                </div>
                <form action={deletePurchase}>
                  <input type="hidden" name="purchaseId" value={p.id} />
                  <GhostButton type="submit">O'chirish</GhostButton>
                </form>
              </div>
            ))}
            {object.purchases.length === 0 && <div className="text-slate-500 text-center py-4">Hozircha yo'q</div>}
          </div>
        </Card>
      </div>
    </Shell>
  );
}
