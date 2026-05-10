"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownToLine, ArrowUpFromLine, PackageCheck, Search } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, SecondaryButton, Select } from "@/components/ui";
import { availabilityFromStock, formatCurrency, labelize } from "@/lib/utils";

type Part = {
  id: string;
  partCode: string;
  name: string;
  category: string;
  compatibleEquipmentTypes: string;
  currentStock: number;
  reservedStock: number;
  minStockLevel: number;
  unitPrice: number;
  supplier: string;
  leadTimeDays: number;
  warehouseLocation: string;
};

type Ticket = {
  id: string;
  ticketCode: string;
  description: string;
  factoryName: string;
};

export function InventoryClient({ parts, tickets }: { parts: Part[]; tickets: Ticket[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ALL");
  const [stockStatus, setStockStatus] = useState("ALL");
  const [selectedPartId, setSelectedPartId] = useState(parts[0]?.id ?? "");
  const [ticketId, setTicketId] = useState(tickets[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [transactionType, setTransactionType] = useState("STOCK_IN");

  const selectedPart = parts.find((part) => part.id === selectedPartId) ?? parts[0];
  const categories = Array.from(new Set(parts.map((part) => part.category)));

  const filteredParts = useMemo(() => {
    return parts.filter((part) => {
      const status = availabilityFromStock(part.currentStock, part.reservedStock, part.minStockLevel);
      const matchesQuery = `${part.partCode} ${part.name} ${part.supplier}`.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === "ALL" || part.category === category;
      const matchesStatus = stockStatus === "ALL" || status === stockStatus;
      return matchesQuery && matchesCategory && matchesStatus;
    });
  }, [parts, query, category, stockStatus]);

  async function reservePart() {
    if (!selectedPart) return;
    const ticket = tickets.find((item) => item.id === ticketId);
    await fetch("/api/inventory/reserve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sparePartId: selectedPart.id,
        ticketId,
        ticketCode: ticket?.ticketCode,
        quantity,
      }),
    });
    startTransition(() => router.refresh());
  }

  async function createTransaction() {
    if (!selectedPart) return;
    await fetch("/api/inventory/transaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sparePartId: selectedPart.id,
        type: transactionType,
        quantity,
        reference: transactionType === "STOCK_IN" ? "รับอะไหล่เข้าเดโม" : "เบิกอะไหล่ออกเดโม",
      }),
    });
    startTransition(() => router.refresh());
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>คลังอะไหล่กลาง</CardTitle>
            <p className="mt-1 text-sm text-slate-500">สต็อกกลาง การจองอะไหล่ สถานะสั่งซื้อเพิ่ม และเครื่องจักรที่ใช้ร่วมกันได้</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-[220px_160px_140px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาอะไหล่" className="pl-9" />
            </div>
            <Select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="ALL">ทุกหมวด</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {labelize(item)}
                </option>
              ))}
            </Select>
            <Select value={stockStatus} onChange={(event) => setStockStatus(event.target.value)}>
              <option value="ALL">ทุกสถานะสต็อก</option>
              <option value="OK">ปกติ</option>
              <option value="LOW">ต่ำ</option>
              <option value="CRITICAL">วิกฤต</option>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">อะไหล่</th>
                <th className="px-5 py-3">หมวด</th>
                <th className="px-5 py-3">ใช้ร่วมกับ</th>
                <th className="px-5 py-3">สต็อก</th>
                <th className="px-5 py-3">พร้อมใช้</th>
                <th className="px-5 py-3">ราคาต่อหน่วย</th>
                <th className="px-5 py-3">ผู้ขาย</th>
                <th className="px-5 py-3">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredParts.map((part) => {
                const available = part.currentStock - part.reservedStock;
                const status = availabilityFromStock(part.currentStock, part.reservedStock, part.minStockLevel);
                return (
                  <tr
                    key={part.id}
                    onClick={() => setSelectedPartId(part.id)}
                    className={selectedPart?.id === part.id ? "bg-blue-50/70" : "cursor-pointer hover:bg-slate-50"}
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{part.name}</p>
                      <p className="text-xs text-slate-500">{part.partCode} · {part.warehouseLocation}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{labelize(part.category)}</td>
                    <td className="px-5 py-4 text-slate-600">{part.compatibleEquipmentTypes.split(", ").map(labelize).join(", ")}</td>
                    <td className="px-5 py-4 text-slate-600">ทั้งหมด {part.currentStock} · จอง {part.reservedStock}</td>
                    <td className="px-5 py-4 font-semibold text-slate-900">{available}</td>
                    <td className="px-5 py-4 text-slate-600">{formatCurrency(part.unitPrice)}</td>
                    <td className="px-5 py-4 text-slate-600">{part.supplier}</td>
                    <td className="px-5 py-4"><StatusBadge value={status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <aside className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>งานคลังอะไหล่</CardTitle>
            <p className="mt-1 text-sm text-slate-500">{selectedPart?.name ?? "เลือกอะไหล่"}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              <MiniStat label="คงคลัง" value={selectedPart?.currentStock ?? 0} />
              <MiniStat label="จองแล้ว" value={selectedPart?.reservedStock ?? 0} />
              <MiniStat label="ขั้นต่ำ" value={selectedPart?.minStockLevel ?? 0} />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">อะไหล่ที่เลือก</label>
              <Select value={selectedPartId} onChange={(event) => setSelectedPartId(event.target.value)} className="mt-1">
                {parts.map((part) => (
                  <option key={part.id} value={part.id}>
                    {part.partCode} - {part.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">ใบแจ้งซ่อม</label>
              <Select value={ticketId} onChange={(event) => setTicketId(event.target.value)} className="mt-1">
                {tickets.map((ticket) => (
                  <option key={ticket.id} value={ticket.id}>
                    {ticket.ticketCode} · {ticket.factoryName}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">จำนวน</label>
              <Input type="number" min={1} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} className="mt-1" />
            </div>
            <Button onClick={reservePart} disabled={isPending || !selectedPart || !ticketId} className="w-full">
              <PackageCheck className="h-4 w-4" />
              จองให้ใบแจ้งซ่อม
            </Button>
            <div className="border-t border-slate-100 pt-4">
              <label className="text-xs font-semibold text-slate-500">รายการเคลื่อนไหวสต็อก</label>
              <div className="mt-2 grid grid-cols-[1fr_96px] gap-2">
                <Select value={transactionType} onChange={(event) => setTransactionType(event.target.value)}>
                  <option value="STOCK_IN">รับเข้า</option>
                  <option value="STOCK_OUT">เบิกออก</option>
                </Select>
                <SecondaryButton onClick={createTransaction} disabled={isPending || !selectedPart} className="px-3">
                  {transactionType === "STOCK_IN" ? <ArrowDownToLine className="h-4 w-4" /> : <ArrowUpFromLine className="h-4 w-4" />}
                  บันทึก
                </SecondaryButton>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent>
            <p className="text-sm font-semibold text-emerald-900">ข้อเสนอแนะสั่งซื้อเพิ่ม</p>
            <p className="mt-2 text-sm leading-6 text-emerald-800">
              ตลับลูกปืน 6308 และซีลปั๊ม 24 มม. มีจำนวนพร้อมใช้ต่ำกว่าระดับขั้นต่ำหลังการจองปัจจุบัน
            </p>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-2 py-3">
      <p className="text-lg font-semibold text-slate-950">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
