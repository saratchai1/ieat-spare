import { TwinMapClient } from "@/components/twin-map-client";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const coordinates: Record<string, { x: number; y: number }> = {
  "F-A": { x: 24, y: 30 },
  "F-B": { x: 63, y: 26 },
  "F-C": { x: 45, y: 52 },
  "F-D": { x: 73, y: 66 },
  "F-E": { x: 28, y: 75 },
};

export default async function TwinMapPage() {
  const factories = await prisma.factory.findMany({
    include: {
      assets: { orderBy: [{ status: "desc" }, { healthScore: "asc" }], take: 4 },
      tickets: true,
      alerts: true,
    },
    orderBy: { code: "asc" },
  });

  const mapItems = factories.map((factory) => {
    const point = coordinates[factory.code] ?? { x: 50, y: 50 };
    return {
      id: factory.id,
      code: factory.code,
      name: factory.name,
      zone: factory.zone,
      status: factory.status,
      riskLevel: factory.riskLevel,
      description: factory.description,
      x: point.x,
      y: point.y,
      activeTickets: factory.tickets.filter((ticket) => !["COMPLETED", "CANCELLED"].includes(ticket.status)).length,
      partRequests: factory.tickets.filter((ticket) => ticket.requestedPartId).length,
      criticalAlerts: factory.alerts.filter((alert) => alert.level === "CRITICAL" && alert.isOpen).length,
      mainAssets: factory.assets.map((asset) => ({
        id: asset.id,
        assetCode: asset.assetCode,
        name: asset.name,
        status: asset.status,
        healthScore: asset.healthScore,
      })),
    };
  });

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">ผังดิจิทัลทวิน</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">ผังปฏิบัติการนิคมอุตสาหกรรมแหลมฉบัง</h1>
      </div>
      <TwinMapClient factories={mapItems} />
    </div>
  );
}
