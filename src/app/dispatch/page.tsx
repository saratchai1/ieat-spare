import { DispatchBoard } from "@/components/dispatch-board";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function DispatchPage() {
  const [tickets, technicians] = await Promise.all([
    prisma.maintenanceTicket.findMany({
      where: { status: { in: ["NEW", "APPROVED", "WAITING_FOR_PARTS", "ASSIGNED"] } },
      include: { factory: true, asset: true },
      orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
      take: 12,
    }),
    prisma.technician.findMany({ orderBy: [{ availability: "asc" }, { workload: "asc" }] }),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">จัดทีมช่าง</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">มอบหมายงานซ่อมภายในนิคมแหลมฉบัง</h1>
      </div>
      <DispatchBoard
        tickets={tickets.map((ticket) => ({
          id: ticket.id,
          ticketCode: ticket.ticketCode,
          description: ticket.description,
          priority: ticket.priority,
          status: ticket.status,
          estimatedHours: ticket.estimatedHours,
          factoryName: ticket.factory.name,
          zone: ticket.factory.zone,
          assetName: ticket.asset.name,
        }))}
        technicians={technicians.map((tech) => ({
          id: tech.id,
          name: tech.name,
          skillType: tech.skillType,
          availability: tech.availability,
          workload: tech.workload,
          baseZone: tech.baseZone,
          currentJob: tech.currentJob,
        }))}
      />
    </div>
  );
}
