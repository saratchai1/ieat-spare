import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, Boxes, CalendarClock, Gauge, Thermometer, Zap } from "lucide-react";
import { AssetSensorChart } from "@/components/charts";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDate, formatDateTime, labelize } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function AssetDetailPage({ params }: Props) {
  const { id } = await params;
  const asset = await prisma.asset.findUnique({
    where: { id },
    include: {
      factory: true,
      sensorReadings: { orderBy: { capturedAt: "asc" } },
      alerts: { orderBy: { createdAt: "desc" } },
      tickets: { include: { technician: true, requestedPart: true, usedPart: true }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!asset) notFound();

  const compatibleParts = await prisma.sparePart.findMany({
    where: { compatibilities: { some: { assetType: asset.type } } },
    orderBy: { partCode: "asc" },
  });

  const latestReading = asset.sensorReadings.at(-1);
  const chartData = asset.sensorReadings.map((reading) => ({
    capturedAt: new Intl.DateTimeFormat("th-TH", { month: "short", day: "numeric" }).format(reading.capturedAt),
    vibration: reading.vibration,
    temperature: reading.temperature,
    currentAmp: reading.currentAmp,
    healthScore: reading.healthScore,
  }));

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">{asset.factory.name}</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">{asset.name}</h1>
          <p className="mt-1 text-sm text-slate-500">{asset.assetCode} · {labelize(asset.type)} · {asset.brandModel}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge value={asset.status} />
          <StatusBadge value={asset.criticality} />
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <TwinMetric label="คะแนนสุขภาพ" value={`${asset.healthScore}/100`} icon={<Gauge className="h-5 w-5" />} />
        <TwinMetric label="แรงสั่นสะเทือน" value={`${latestReading?.vibration.toFixed(1) ?? "-"} mm/s`} icon={<AlertTriangle className="h-5 w-5" />} danger={Number(latestReading?.vibration ?? 0) > 7.5} />
        <TwinMetric label="อุณหภูมิ" value={`${latestReading?.temperature.toFixed(1) ?? "-"} C`} icon={<Thermometer className="h-5 w-5" />} danger={Number(latestReading?.temperature ?? 0) > 75} />
        <TwinMetric label="กระแสไฟฟ้า" value={`${latestReading?.currentAmp.toFixed(1) ?? "-"} A`} icon={<Zap className="h-5 w-5" />} />
        <TwinMetric label="ชั่วโมงเดินเครื่อง" value={`${latestReading?.runtimeHours.toLocaleString("th-TH") ?? asset.operatingHours.toLocaleString("th-TH")} ชม.`} icon={<CalendarClock className="h-5 w-5" />} />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>แนวโน้มเซนเซอร์ดิจิทัลทวิน</CardTitle>
            <p className="mt-1 text-sm text-slate-500">แรงสั่น อุณหภูมิ กระแสไฟฟ้า และคะแนนสุขภาพที่คำนวณจากระบบ</p>
          </CardHeader>
          <CardContent>
            <AssetSensorChart readings={chartData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>แผนบำรุงรักษา</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <PlanRow label="ชั่วโมงเดินเครื่อง" value={asset.operatingHours.toLocaleString("th-TH")} />
            <PlanRow label="ซ่อมล่าสุด" value={formatDate(asset.lastMaintenanceAt)} />
            <PlanRow label="บำรุงครั้งถัดไป" value={formatDate(asset.nextPmAt)} />
            <PlanRow label="วันที่ติดตั้ง" value={formatDate(asset.installDate)} />
            <Link href={`/tickets?factory=${asset.factoryId}`} className="inline-flex h-10 w-full items-center justify-center rounded-md bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800">
              เปิดใบแจ้งซ่อมของโรงงาน
            </Link>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>ประวัติซ่อมบำรุง</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {asset.tickets.slice(0, 6).map((ticket) => (
              <Link key={ticket.id} href={`/tickets/${ticket.id}`} className="block rounded-md border border-slate-200 p-3 transition hover:bg-slate-50">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-blue-700">{ticket.ticketCode}</p>
                  <StatusBadge value={ticket.status} />
                  <StatusBadge value={ticket.priority} />
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{ticket.description}</p>
                  <p className="mt-1 text-xs text-slate-400">{formatDateTime(ticket.createdAt)} · {ticket.technician?.name ?? "ยังไม่มอบหมาย"}</p>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>อะไหล่ที่ใช้ร่วมกันได้</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {compatibleParts.map((part) => (
              <div key={part.id} className="rounded-md border border-slate-200 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{part.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{part.partCode} · {labelize(part.category)} · {part.warehouseLocation}</p>
                  </div>
                  <Boxes className="h-4 w-4 text-slate-400" />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-500">
                  <span>คงคลัง {part.currentStock}</span>
                  <span>จอง {part.reservedStock}</span>
                  <span>{formatCurrency(part.unitPrice)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function TwinMetric({ label, value, icon, danger }: { label: string; value: string; icon: React.ReactNode; danger?: boolean }) {
  return (
    <div className={`rounded-lg border bg-white p-4 shadow-sm ${danger ? "border-rose-200" : "border-slate-200"}`}>
      <div className={`flex items-center gap-2 ${danger ? "text-rose-700" : "text-blue-700"}`}>{icon}<span className="text-sm font-semibold">{label}</span></div>
      <p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function PlanRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-sm last:border-0 last:pb-0">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}
