import { InventoryClient } from "@/components/inventory-client";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const [parts, tickets] = await Promise.all([
    prisma.sparePart.findMany({ orderBy: { partCode: "asc" } }),
    prisma.maintenanceTicket.findMany({
      where: { status: { notIn: ["COMPLETED", "CANCELLED"] } },
      include: { factory: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">คลังกลางนิคมแหลมฉบัง</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">คลังอะไหล่กลางสำหรับโรงงานในนิคม</h1>
      </div>
      <InventoryClient
        parts={parts.map((part) => ({
          id: part.id,
          partCode: part.partCode,
          name: part.name,
          category: part.category,
          compatibleEquipmentTypes: part.compatibleEquipmentTypes,
          currentStock: part.currentStock,
          reservedStock: part.reservedStock,
          minStockLevel: part.minStockLevel,
          unitPrice: part.unitPrice,
          supplier: part.supplier,
          leadTimeDays: part.leadTimeDays,
          warehouseLocation: part.warehouseLocation,
        }))}
        tickets={tickets.map((ticket) => ({
          id: ticket.id,
          ticketCode: ticket.ticketCode,
          description: ticket.description,
          factoryName: ticket.factory.name,
        }))}
      />
    </div>
  );
}
