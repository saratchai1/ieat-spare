"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ClipboardCheck, UserRoundCheck } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Select, Textarea } from "@/components/ui";

type Technician = { id: string; name: string; skillType: string; availability: string };
type Part = { id: string; partCode: string; name: string };

export function TicketActions({
  ticketId,
  currentStatus,
  requestedPartId,
  technicians,
  parts,
}: {
  ticketId: string;
  currentStatus: string;
  requestedPartId?: string | null;
  technicians: Technician[];
  parts: Part[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState(currentStatus);
  const [technicianId, setTechnicianId] = useState(technicians.find((tech) => tech.availability === "AVAILABLE")?.id ?? technicians[0]?.id ?? "");
  const [usedPartId, setUsedPartId] = useState(requestedPartId ?? parts[0]?.id ?? "");
  const [note, setNote] = useState("");

  async function updateTicket(payload: Record<string, unknown>) {
    await fetch(`/api/tickets/${ticketId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, note: note || undefined }),
    });
    setNote("");
    startTransition(() => router.refresh());
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>ควบคุมงานซ่อม</CardTitle>
        <p className="mt-1 text-sm text-slate-500">อนุมัติ มอบหมายช่าง อัปเดตสถานะ และบันทึกอะไหล่ที่ใช้</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-500">ช่างซ่อมบำรุง</label>
          <Select value={technicianId} onChange={(event) => setTechnicianId(event.target.value)} className="mt-1">
            {technicians.map((tech) => (
              <option key={tech.id} value={tech.id}>
                {tech.name} · {tech.skillType}
              </option>
            ))}
          </Select>
        </div>
        <Button disabled={isPending || !technicianId} onClick={() => updateTicket({ technicianId, status: "ASSIGNED" })} className="w-full">
          <UserRoundCheck className="h-4 w-4" />
          มอบหมายช่าง
        </Button>
        <div className="grid grid-cols-[1fr_120px] gap-2">
          <Select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="NEW">ใหม่</option>
            <option value="APPROVED">อนุมัติแล้ว</option>
            <option value="ASSIGNED">มอบหมายแล้ว</option>
            <option value="IN_PROGRESS">กำลังดำเนินการ</option>
            <option value="WAITING_FOR_PARTS">รออะไหล่</option>
            <option value="COMPLETED">เสร็จสิ้น</option>
            <option value="CANCELLED">ยกเลิก</option>
          </Select>
          <Button disabled={isPending} onClick={() => updateTicket({ status })} className="px-3">
            <ClipboardCheck className="h-4 w-4" />
            บันทึก
          </Button>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500">อะไหล่ที่ใช้จริง</label>
          <Select value={usedPartId} onChange={(event) => setUsedPartId(event.target.value)} className="mt-1">
            {parts.map((part) => (
              <option key={part.id} value={part.id}>
                {part.partCode} · {part.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500">บันทึกงาน</label>
          <Textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="ผลตรวจ สาเหตุ หรือขั้นตอนถัดไป" className="mt-1" />
        </div>
        <Button disabled={isPending || !usedPartId} onClick={() => updateTicket({ status: "COMPLETED", usedPartId })} className="w-full bg-emerald-700 hover:bg-emerald-800">
          <CheckCircle2 className="h-4 w-4" />
          ปิดงานและเบิกอะไหล่
        </Button>
      </CardContent>
    </Card>
  );
}
