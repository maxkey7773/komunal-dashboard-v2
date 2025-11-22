"use client";

import { useState } from "react";
import { Button, Input, Label } from "@/components/ui";

export default function PurchaseForm({ action }: { action: (fd: FormData)=>void }) {
  const [uploading, setUploading] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState("");

  async function onFileChange(e: any) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    setReceiptUrl(data.url || "");
    setUploading(false);
  }

  return (
    <form action={action} className="grid md:grid-cols-6 gap-2 items-end">
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
      <div className="md:col-span-2">
        <Label>Chek rasmi</Label>
        <Input name="receiptFile" type="file" accept="image/*" onChange={onFileChange} />
        <input type="hidden" name="receiptUrl" value={receiptUrl} />
        {uploading && <div className="text-xs text-slate-400 mt-1">Yuklanmoqda...</div>}
        {receiptUrl && <div className="text-xs text-emerald-300 mt-1">Yuklandi ✅</div>}
      </div>
      <div className="md:col-span-6">
        <Button type="submit" disabled={uploading}>Qo'shish</Button>
      </div>
    </form>
  );
}
