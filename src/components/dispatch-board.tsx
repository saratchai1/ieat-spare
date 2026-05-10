"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Clock3, MapPin, UserRoundCheck } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { Button, Card, CardContent, CardHeader, CardTitle, Select } from "@/components/ui";

type Ticket = {
  id: string;
  ticketCode: string;
  description: string;
  priority: string;
  status: string;
  estimatedHours: number;
  factoryName: string;
  zone: string;
  assetName: string;
};

type Technician = {
  id: string;
  name: string;
  skillType: string;
  availability: string;
  workload: number;
  baseZone: string;
  currentJob?: string | null;
};

export function DispatchBoard({ tickets, technicians }: { tickets: Ticket[]; technicians: Technician[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedTechByTicket, setSelectedTechByTicket] = useState<Record<string, string>>({});

  async function assign(ticketId: string) {
    const technicianId = selectedTechByTicket[ticketId] ?? technicians.find((tech) => tech.availability === "AVAILABLE")?.id ?? technicians[0]?.id;
    await fetch(`/api/tickets/${ticketId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ technicianId, status: "ASSIGNED", note: "มอบหมายช่างจากกระดานจัดทีมแล้ว" }),
    });
    startTransition(() => router.refresh());
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <Card key={ticket.id}>
            <CardContent className="grid gap-4 p-5 lg:grid-cols-[1fr_260px] lg:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-blue-700">{ticket.ticketCode}</p>
                  <StatusBadge value={ticket.priority} />
                  <StatusBadge value={ticket.status} />
                </div>
                <h3 className="mt-2 text-lg font-semibold text-slate-950">{ticket.assetName}</h3>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">{ticket.description}</p>
                <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{ticket.factoryName} · {ticket.zone}</span>
                  <span className="inline-flex items-center gap-1"><Clock3 className="h-4 w-4" />{ticket.estimatedHours} ชม. งานบริการ</span>
                </div>
              </div>
              <div className="space-y-2">
                <Select
                  value={selectedTechByTicket[ticket.id] ?? ""}
                  onChange={(event) => setSelectedTechByTicket((current) => ({ ...current, [ticket.id]: event.target.value }))}
                >
                  <option value="">ช่างที่พร้อมที่สุด</option>
                  {technicians.map((tech) => (
                    <option key={tech.id} value={tech.id}>
                      {tech.name} · {tech.skillType}
                    </option>
                  ))}
                </Select>
                <Button onClick={() => assign(ticket.id)} disabled={isPending} className="w-full">
                  <UserRoundCheck className="h-4 w-4" />
                  มอบหมาย
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>กำลังทีมช่าง</CardTitle>
          <p className="mt-1 text-sm text-slate-500">ความพร้อม ทักษะ โซนประจำ และภาระงาน</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {technicians.map((tech) => (
            <div key={tech.id} className="rounded-md border border-slate-200 p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{tech.name}</p>
                  <p className="text-xs text-slate-500">{tech.skillType} · {tech.baseZone}</p>
                </div>
                <StatusBadge value={tech.availability} />
              </div>
              <div className="mt-3 h-2 rounded-full bg-slate-100">
                <div className="h-2 rounded-full bg-blue-600" style={{ width: `${Math.min(100, tech.workload)}%` }} />
              </div>
              <p className="mt-2 text-xs text-slate-500">{tech.currentJob ?? "ไม่มีงานที่กำลังทำ"} · ภาระงาน {tech.workload}%</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
