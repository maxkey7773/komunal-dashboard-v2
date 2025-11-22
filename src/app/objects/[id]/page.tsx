import Shell from "@/components/shell";
import { prisma } from "@/lib/prisma";
import { Card, Hr } from "@/components/ui";

export default async function ObjectView({ params }: { params: { id: string }}) {
  const object = await prisma.object.findUnique({
    where: { id: params.id },
    include: {
      utilityAccounts: { include: { category: true } },
      inspectors: { include: { category: true } },
      expenses: { include: { category: true }, orderBy: { createdAt: "desc" } },
      purchases: true
    }
  });
  if (!object) return <div>Not found</div>;

  return (
    <Shell>
      <div className="space-y-4">
        <Card>
          <div className="text-xl font-semibold">{object.name}</div>
          <div className="text-sm text-slate-400">{object.type} • {object.address || "-"}</div>
        </Card>

        <Card>
          <div className="font-semibold">Kommunal ID raqamlari</div>
          <Hr />
          <div className="grid md:grid-cols-2 gap-2 text-sm">
            {object.utilityAccounts.map(u => (
              <div key={u.id} className="card p-2">
                <div>{u.category.name}</div>
                <div className="text-slate-400">{u.accountNumber}</div>
              </div>
            ))}
            {object.utilityAccounts.length === 0 && <div className="text-slate-500">Kiritilmagan</div>}
          </div>
        </Card>

        <Card>
          <div className="font-semibold">Inspektorlar</div>
          <Hr />
          <div className="grid md:grid-cols-2 gap-2 text-sm">
            {object.inspectors.map(i => (
              <div key={i.id} className="card p-2">
                <div>{i.category.name}</div>
                <div className="text-slate-400">{i.inspectorName} • {i.inspectorPhone}</div>
              </div>
            ))}
            {object.inspectors.length === 0 && <div className="text-slate-500">Kiritilmagan</div>}
          </div>
        </Card>

        <Card>
          <div className="font-semibold">Harajatlar</div>
          <Hr />
          <div className="space-y-2">
            {object.expenses.map(e => (
              <div key={e.id} className="card p-3">
                <div className="font-medium">{e.category.name} {e.title ? `(${e.title})` : ""}</div>
                <div className="text-xs text-slate-500">
                  {Number(e.amount).toLocaleString()} so'm • qarz: {Number(e.debtAmount).toLocaleString()} • {e.status}
                </div>
              </div>
            ))}
            {object.expenses.length === 0 && <div className="text-slate-500 text-center py-6">Harajat yo'q</div>}
          </div>
        </Card>

        <Card>
          <div className="font-semibold">Sotib olingan narsalar</div>
          <Hr />
          <div className="space-y-2">
            {object.purchases.map(p => (
              <div key={p.id} className="card p-3">
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
            ))}
            {object.purchases.length === 0 && <div className="text-slate-500 text-center py-6">Yo'q</div>}
          </div>
        </Card>
      </div>
    </Shell>
  );
}
