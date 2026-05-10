import { Suspense } from "react";
import { TicketsClient } from "@/components/tickets-client";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function TicketsPage() {
  const [factories, parts, tickets] = await Promise.all([
    prisma.factory.findMany({ include: { assets: { orderBy: { assetCode: "asc" } } }, orderBy: { code: "asc" } }),
    prisma.sparePart.findMany({ orderBy: { partCode: "asc" } }),
    prisma.maintenanceTicket.findMany({
      include: { factory: true, asset: true, technician: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">กระบวนการซ่อมบำรุง</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">ใบแจ้งซ่อมและคำขอบริการ</h1>
      </div>
      <Suspense>
        <TicketsClient
          factories={factories.map((factory) => ({
            id: factory.id,
            name: factory.name,
            assets: factory.assets.map((asset) => ({
              id: asset.id,
              name: asset.name,
              assetCode: asset.assetCode,
              type: asset.type,
            })),
          }))}
          parts={parts.map((part) => ({
            id: part.id,
            partCode: part.partCode,
            name: part.name,
          }))}
          tickets={tickets.map((ticket) => ({
            id: ticket.id,
            ticketCode: ticket.ticketCode,
            description: ticket.description,
            status: ticket.status,
            priority: ticket.priority,
            maintenanceType: ticket.maintenanceType,
            createdAt: ticket.createdAt.toISOString(),
            factoryName: ticket.factory.name,
            factoryId: ticket.factoryId,
            assetName: ticket.asset.name,
            technicianName: ticket.technician?.name,
          }))}
        />
      </Suspense>
    </div>
  );
}
