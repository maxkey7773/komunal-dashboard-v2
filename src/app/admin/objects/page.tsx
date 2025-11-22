import Shell from "@/components/shell";
import { prisma } from "@/lib/prisma";
import { Card, Button, Input, Label, Select, Hr, GhostButton } from "@/components/ui";
import { revalidatePath } from "next/cache";

export default async function ObjectsPage() {
  const objects = await prisma.object.findMany({ orderBy: { createdAt: "desc" } });

  async function createAction(formData: FormData) {
    "use server";
    const name = String(formData.get("name"));
    const type = String(formData.get("type")) as any;
    const ownerName = String(formData.get("ownerName") || "");
    const ownerPhone = String(formData.get("ownerPhone") || "");
    const address = String(formData.get("address") || "");
    await prisma.object.create({ data: { name, type, ownerName, ownerPhone, address } });
    revalidatePath("/admin/objects");
  }

  async function deleteAction(formData: FormData) {
    "use server";
    const id = String(formData.get("id"));
    await prisma.object.delete({ where: { id } });
    revalidatePath("/admin/objects");
  }

  return (
    <Shell admin>
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1 h-fit">
          <div className="text-lg font-semibold">Yangi obyekt</div>
          <Hr />
          <form action={createAction} className="space-y-3">
            <div>
              <Label>Nomi</Label>
              <Input name="name" required />
            </div>
            <div>
              <Label>Turi</Label>
              <Select name="type">
                <option value="TURAR_MULK">Turar mulk</option>
                <option value="NOTURAR_MULK">Noturar mulk</option>
                <option value="AVTOMASHINA">Avtomashina</option>
                <option value="JARIMA">Jarima</option>
                <option value="BOSHQA">Boshqa</option>
              </Select>
            </div>
            <div>
              <Label>Mulk egasi</Label>
              <Input name="ownerName" />
            </div>
            <div>
              <Label>Telefon</Label>
              <Input name="ownerPhone" />
            </div>
            <div>
              <Label>Manzil</Label>
              <Input name="address" />
            </div>
            <Button className="w-full" type="submit">Saqlash</Button>
          </form>
        </Card>

        <Card className="lg:col-span-2">
          <div className="text-lg font-semibold">Obyektlar</div>
          <Hr />
          <div className="space-y-2">
            {objects.map(o => (
              <div key={o.id} className="card p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{o.name}</div>
                  <div className="text-xs text-slate-500">{o.type} • {o.ownerName || "-"} • {o.address || "-"}</div>
                </div>
                <div className="flex gap-2">
                  <a className="btn btn-ghost" href={`/admin/objects/${o.id}`}>Profil</a>
                  <form action={deleteAction}>
                    <input type="hidden" name="id" value={o.id} />
                    <GhostButton type="submit">O'chirish</GhostButton>
                  </form>
                </div>
              </div>
            ))}
            {objects.length === 0 && <div className="text-slate-500 text-center py-6">Obyekt yo'q</div>}
          </div>
        </Card>
      </div>
    </Shell>
  );
}
