import Link from "next/link";
import { AlertTriangle, Gauge, Thermometer, Wrench } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AlertsPage() {
  const alerts = await prisma.alert.findMany({
    include: { factory: true, asset: true },
    orderBy: [{ level: "asc" }, { createdAt: "desc" }],
  });

  const levelCounts = {
    CRITICAL: alerts.filter((alert) => alert.level === "CRITICAL").length,
    WARNING: alerts.filter((alert) => alert.level === "WARNING").length,
    INFO: alerts.filter((alert) => alert.level === "INFO").length,
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">บำรุงรักษาเชิงคาดการณ์</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">การแจ้งเตือนดิจิทัลทวิน</h1>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <AlertStat label="วิกฤต" value={levelCounts.CRITICAL} tone="rose" />
        <AlertStat label="เฝ้าระวัง" value={levelCounts.WARNING} tone="amber" />
        <AlertStat label="ข้อมูล" value={levelCounts.INFO} tone="blue" />
      </section>

      <Card>
        <CardHeader>
          <CardTitle>สัญญาณเตือนเซนเซอร์และงานบำรุงที่เปิดอยู่</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="rounded-lg border border-slate-200 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge value={alert.level} />
                    <p className="text-sm font-semibold text-slate-900">{alert.factory.name} · {alert.asset.name}</p>
                  </div>
                  <h2 className="mt-3 text-lg font-semibold text-slate-950">{alert.message}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{alert.recommendedAction}</p>
                  <p className="mt-2 text-xs text-slate-400">{formatDateTime(alert.createdAt)}</p>
                </div>
                <div className="grid min-w-64 grid-cols-2 gap-2">
                  <Signal label={alert.metric} value={alert.value} icon={alert.metric === "อุณหภูมิ" ? <Thermometer className="h-4 w-4" /> : <Gauge className="h-4 w-4" />} />
                  <Signal label="ค่าเกณฑ์" value={alert.threshold} icon={<AlertTriangle className="h-4 w-4" />} />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href={`/assets/${alert.assetId}`} className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-blue-700 px-3 text-sm font-semibold text-white hover:bg-blue-800">
                  <Gauge className="h-4 w-4" />
                  เปิดทวินเครื่องจักร
                </Link>
                <Link href="/tickets" className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                  <Wrench className="h-4 w-4" />
                  ใบแจ้งซ่อม
                </Link>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function AlertStat({ label, value, tone }: { label: string; value: number; tone: "rose" | "amber" | "blue" }) {
  const color = tone === "rose" ? "text-rose-700 bg-rose-50 border-rose-200" : tone === "amber" ? "text-amber-700 bg-amber-50 border-amber-200" : "text-blue-700 bg-blue-50 border-blue-200";
  return (
    <div className={`rounded-lg border p-4 shadow-sm ${color}`}>
      <p className="text-sm font-semibold">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function Signal({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">{icon}{label}</div>
      <p className="mt-2 text-lg font-semibold text-slate-950">{value}</p>
    </div>
  );
}
