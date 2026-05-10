"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Select, Textarea } from "@/components/ui";
import { formatDateTime, labelize } from "@/lib/utils";

type FactoryOption = { id: string; name: string; assets: { id: string; name: string; assetCode: string; type: string }[] };
type PartOption = { id: string; partCode: string; name: string };
type TicketRow = {
  id: string;
  ticketCode: string;
  description: string;
  status: string;
  priority: string;
  maintenanceType: string;
  createdAt: string;
  factoryName: string;
  factoryId: string;
  assetName: string;
  technicianName?: string | null;
};

export function TicketsClient({ factories, parts, tickets }: { factories: FactoryOption[]; parts: PartOption[]; tickets: TicketRow[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const initialFactory = searchParams.get("factory") ?? factories[0]?.id ?? "";
  const [factoryId, setFactoryId] = useState(initialFactory);
  const [assetId, setAssetId] = useState(factories.find((factory) => factory.id === initialFactory)?.assets[0]?.id ?? factories[0]?.assets[0]?.id ?? "");
  const [requestedPartId, setRequestedPartId] = useState(parts.find((part) => part.partCode === "BRG-6308")?.id ?? parts[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("ALL");

  const selectedFactory = factories.find((factory) => factory.id === factoryId) ?? factories[0];
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesQuery = `${ticket.ticketCode} ${ticket.description} ${ticket.factoryName} ${ticket.assetName}`.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = status === "ALL" || ticket.status === status;
      const matchesFactory = !searchParams.get("factory") || ticket.factoryId === searchParams.get("factory");
      return matchesQuery && matchesStatus && matchesFactory;
    });
  }, [tickets, query, status, searchParams]);

  async function createTicket(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        factoryId,
        assetId,
        requestedPartId,
        description: form.get("description"),
        priority: form.get("priority"),
        maintenanceType: form.get("maintenanceType"),
        preferredServiceTime: form.get("preferredServiceTime"),
        estimatedHours: form.get("estimatedHours"),
      }),
    });
    event.currentTarget.reset();
    startTransition(() => router.refresh());
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>ระบบใบแจ้งซ่อม</CardTitle>
            <p className="mt-1 text-sm text-slate-500">คำขอซ่อม การอนุมัติ ความต้องการอะไหล่ และสถานะงาน</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-[220px_160px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาใบแจ้งซ่อม" className="pl-9" />
            </div>
            <Select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="ALL">ทุกสถานะ</option>
              <option value="NEW">ใหม่</option>
              <option value="APPROVED">อนุมัติแล้ว</option>
              <option value="ASSIGNED">มอบหมายแล้ว</option>
              <option value="IN_PROGRESS">กำลังดำเนินการ</option>
              <option value="WAITING_FOR_PARTS">รออะไหล่</option>
              <option value="COMPLETED">เสร็จสิ้น</option>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">ใบงาน</th>
                <th className="px-5 py-3">โรงงาน</th>
                <th className="px-5 py-3">เครื่องจักร</th>
                <th className="px-5 py-3">ความเร่งด่วน</th>
                <th className="px-5 py-3">สถานะ</th>
                <th className="px-5 py-3">ช่าง</th>
                <th className="px-5 py-3">สร้างเมื่อ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <Link href={`/tickets/${ticket.id}`} className="font-semibold text-blue-700 hover:text-blue-900">
                      {ticket.ticketCode}
                    </Link>
                    <p className="mt-1 line-clamp-1 max-w-md text-xs text-slate-500">{ticket.description}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{ticket.factoryName}</td>
                  <td className="px-5 py-4 text-slate-600">{ticket.assetName}</td>
                  <td className="px-5 py-4"><StatusBadge value={ticket.priority} /></td>
                  <td className="px-5 py-4"><StatusBadge value={ticket.status} /></td>
                  <td className="px-5 py-4 text-slate-600">{ticket.technicianName ?? "-"}</td>
                  <td className="px-5 py-4 text-slate-600">{formatDateTime(ticket.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>สร้างคำขอซ่อม</CardTitle>
          <p className="mt-1 text-sm text-slate-500">ฟอร์มผู้ใช้งานโรงงานพร้อมการแนะนำอะไหล่</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={createTicket} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-500">โรงงาน</label>
              <Select
                value={factoryId}
                onChange={(event) => {
                  const nextFactory = factories.find((factory) => factory.id === event.target.value);
                  setFactoryId(event.target.value);
                  setAssetId(nextFactory?.assets[0]?.id ?? "");
                }}
                className="mt-1"
              >
                {factories.map((factory) => (
                  <option key={factory.id} value={factory.id}>{factory.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">เครื่องจักร</label>
              <Select value={assetId} onChange={(event) => setAssetId(event.target.value)} className="mt-1">
                {selectedFactory?.assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>{asset.assetCode} · {asset.name}</option>
                ))}
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">รายละเอียดปัญหา</label>
              <Textarea name="description" required placeholder="ระบุอาการ ผลกระทบต่อการผลิต และข้อกังวลด้านความปลอดภัย" className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500">ความเร่งด่วน</label>
                <Select name="priority" defaultValue="HIGH" className="mt-1">
                  <option value="LOW">ต่ำ</option>
                  <option value="MEDIUM">ปานกลาง</option>
                  <option value="HIGH">สูง</option>
                  <option value="CRITICAL">วิกฤต</option>
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">ประเภทงาน</label>
                <Select name="maintenanceType" defaultValue="CORRECTIVE" className="mt-1">
                  <option value="PREVENTIVE">{labelize("PREVENTIVE")}</option>
                  <option value="CORRECTIVE">{labelize("CORRECTIVE")}</option>
                  <option value="EMERGENCY">{labelize("EMERGENCY")}</option>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500">อะไหล่ที่ต้องการ</label>
              <Select value={requestedPartId} onChange={(event) => setRequestedPartId(event.target.value)} className="mt-1">
                {parts.map((part) => (
                  <option key={part.id} value={part.id}>{part.partCode} · {part.name}</option>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-500">เวลาที่สะดวก</label>
                <Input name="preferredServiceTime" type="datetime-local" className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">ชม. ประเมิน</label>
                <Input name="estimatedHours" type="number" defaultValue={2} min={0.5} step={0.5} className="mt-1" />
              </div>
            </div>
            <Button disabled={isPending || !assetId} className="w-full">
              <Plus className="h-4 w-4" />
              สร้างใบแจ้งซ่อม
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
