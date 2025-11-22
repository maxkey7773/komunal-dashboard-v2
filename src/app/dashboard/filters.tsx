"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button, Select, Input, Label, Card } from "@/components/ui";
import { useMemo, useState } from "react";

export default function DashboardFilters({ objects, categories }: any) {
  const router = useRouter();
  const sp = useSearchParams();

  const [objectId, setObjectId] = useState(sp.get("objectId") || "");
  const [categoryId, setCategoryId] = useState(sp.get("categoryId") || "");
  const [range, setRange] = useState(sp.get("range") || "month");
  const [from, setFrom] = useState(sp.get("from") || "");
  const [to, setTo] = useState(sp.get("to") || "");

  function apply() {
    const params = new URLSearchParams();
    if (objectId) params.set("objectId", objectId);
    if (categoryId) params.set("categoryId", categoryId);
    if (range) params.set("range", range);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    router.push(`/dashboard?${params.toString()}`);
  }

  function clear() {
    router.push("/dashboard");
  }

  return (
    <Card className="p-4">
      <div className="font-semibold mb-3">Filtrlar</div>
      <div className="grid md:grid-cols-5 gap-3 items-end">
        <div>
          <Label>Obyekt</Label>
          <Select value={objectId} onChange={(e:any)=>setObjectId(e.target.value)}>
            <option value="">Barchasi</option>
            {objects.map((o:any)=>(
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Harajat turi</Label>
          <Select value={categoryId} onChange={(e:any)=>setCategoryId(e.target.value)}>
            <option value="">Barchasi</option>
            {categories.map((c:any)=>(
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Davr</Label>
          <Select value={range} onChange={(e:any)=>setRange(e.target.value)}>
            <option value="week">Hafta</option>
            <option value="month">Oy</option>
            <option value="year">Yil</option>
            <option value="custom">Custom</option>
          </Select>
        </div>
        <div>
          <Label>Dan</Label>
          <Input type="date" value={from} onChange={(e:any)=>setFrom(e.target.value)} disabled={range!=="custom"} />
        </div>
        <div>
          <Label>Gacha</Label>
          <Input type="date" value={to} onChange={(e:any)=>setTo(e.target.value)} disabled={range!=="custom"} />
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <Button type="button" onClick={apply}>Qo'llash</Button>
        <Button type="button" className="btn-ghost" onClick={clear}>Tozalash</Button>
      </div>
    </Card>
  );
}
