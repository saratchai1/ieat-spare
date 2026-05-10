import { Activity, CalendarClock, Factory } from "lucide-react";
import { AssetRegistryClient } from "@/components/asset-registry-client";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AssetsPage() {
  const [assets, factories] = await Promise.all([
    prisma.asset.findMany({ include: { factory: true }, orderBy: [{ status: "asc" }, { healthScore: "asc" }] }),
    prisma.factory.findMany({ orderBy: { code: "asc" } }),
  ]);
  const demoCutoff = new Date("2026-05-24T00:00:00.000+07:00");
  const pmDueSoonCount = assets.filter((asset) => asset.nextPmAt < demoCutoff).length;

  return (
    <div className="space-y-5">
      <AssetRegistryClient
        factories={factories.map((factory) => ({ id: factory.id, name: factory.name }))}
        assets={assets.map((asset) => ({
          id: asset.id,
          assetCode: asset.assetCode,
          factoryId: asset.factoryId,
          factoryCode: asset.factory.code,
          name: asset.name,
          type: asset.type,
          brandModel: asset.brandModel,
          operatingHours: asset.operatingHours,
          healthScore: asset.healthScore,
          lastMaintenanceAt: asset.lastMaintenanceAt.toISOString(),
          nextPmAt: asset.nextPmAt.toISOString(),
          criticality: asset.criticality,
          status: asset.status,
        }))}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Insight title="ครอบคลุมดิจิทัลทวิน" value="30 เครื่อง" icon={<Activity className="h-5 w-5" />} />
        <Insight title="เครื่องจักรวิกฤต" value={`${assets.filter((asset) => asset.criticality === "CRITICAL").length} เครื่อง`} icon={<Factory className="h-5 w-5" />} />
        <Insight title="ถึงกำหนดบำรุงใกล้ ๆ นี้" value={`${pmDueSoonCount} เครื่อง`} icon={<CalendarClock className="h-5 w-5" />} />
      </div>
    </div>
  );
}

function Insight({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 text-blue-700">{icon}<span className="text-sm font-semibold">{title}</span></div>
      <p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}
