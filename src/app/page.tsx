import Link from "next/link";
import { AlertTriangle, Boxes, Building2, Gauge, RadioTower, TrendingDown, Users, Wrench } from "lucide-react";
import { DashboardCharts } from "@/components/charts";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { prisma } from "@/lib/db";
import { availabilityFromStock, formatDateTime, labelize } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [factories, assets, tickets, parts, technicians, alerts, transactions] = await Promise.all([
    prisma.factory.findMany({ include: { assets: true, tickets: true } }),
    prisma.asset.findMany(),
    prisma.maintenanceTicket.findMany({
      include: { factory: true, asset: true, technician: true, requestedPart: true, usedPart: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.sparePart.findMany(),
    prisma.technician.findMany(),
    prisma.alert.findMany({ include: { factory: true, asset: true }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.inventoryTransaction.findMany({ include: { sparePart: true } }),
  ]);

  const openTickets = tickets.filter((ticket) => !["COMPLETED", "CANCELLED"].includes(ticket.status));
  const criticalAlerts = alerts.filter((alert) => alert.level === "CRITICAL" && alert.isOpen);
  const lowStock = parts.filter((part) => availabilityFromStock(part.currentStock, part.reservedStock, part.minStockLevel) !== "OK");
  const utilization = Math.round(technicians.reduce((sum, tech) => sum + tech.workload, 0) / technicians.length);

  const statusData = Object.entries(
    tickets.reduce<Record<string, number>>((acc, ticket) => {
      acc[labelize(ticket.status)] = (acc[labelize(ticket.status)] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const usageData = Object.entries(
    transactions
      .filter((transaction) => transaction.type !== "STOCK_IN")
      .reduce<Record<string, number>>((acc, transaction) => {
        const key = labelize(transaction.sparePart.category);
        acc[key] = (acc[key] ?? 0) + transaction.quantity;
        return acc;
      }, {}),
  ).map(([name, value]) => ({ name, value }));

  const downtimeData = factories.map((factory) => ({
    name: factory.code,
    hours: Number(tickets.filter((ticket) => ticket.factoryId === factory.id).reduce((sum, ticket) => sum + ticket.downtimeHours, 0).toFixed(1)),
  }));

  const maintenanceMix = Object.entries(
    tickets.reduce<Record<string, number>>((acc, ticket) => {
      acc[labelize(ticket.maintenanceType)] = (acc[labelize(ticket.maintenanceType)] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const metrics = [
    { label: "โรงงานในนิคม", value: factories.length, icon: Building2, tone: "text-blue-700", href: "/twin-map" },
    { label: "เครื่องจักรลงทะเบียน", value: assets.length, icon: RadioTower, tone: "text-emerald-700", href: "/assets" },
    { label: "ใบแจ้งซ่อมเปิดอยู่", value: openTickets.length, icon: Wrench, tone: "text-amber-700", href: "/tickets" },
    { label: "เตือนวิกฤต", value: criticalAlerts.length, icon: AlertTriangle, tone: "text-rose-700", href: "/alerts" },
    { label: "อะไหล่ต่ำกว่าขั้นต่ำ", value: lowStock.length, icon: Boxes, tone: "text-orange-700", href: "/inventory" },
    { label: "การใช้งานทีมช่าง", value: `${utilization}%`, icon: Users, tone: "text-indigo-700", href: "/dispatch" },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-blue-200 bg-white shadow-sm">
        <div className="grid gap-4 p-5 lg:grid-cols-[1fr_340px] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">ศูนย์สั่งการผู้บริหาร</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 md:text-3xl">
              ควบคุมคลังอะไหล่กลางและงานซ่อมบำรุงของนิคมอุตสาหกรรมแหลมฉบัง
            </h1>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">
              รวมสัญญาณดิจิทัลทวิน การจองอะไหล่จากคลังกลาง การจัดทีมช่าง และ KPI ซ่อมบำรุงไว้ในมุมมองเดียวสำหรับผู้บริหารนิคม
            </p>
          </div>
          <div className="rounded-lg bg-slate-950 p-4 text-white">
            <div className="flex items-center gap-2 text-sm font-semibold text-rose-200">
              <AlertTriangle className="h-4 w-4" />
              สถานการณ์เดโมหลัก
            </div>
            <p className="mt-2 text-xl font-semibold">สัญญาณสั่นสะเทือนวิกฤตที่โรงงาน B</p>
            <p className="mt-1 text-sm leading-6 text-slate-300">
              ระบบแนะนำตลับลูกปืน 6308 สำหรับมอเตอร์ที่มีความเสี่ยง และสามารถจองจากคลังอะไหล่กลางได้ทันที
            </p>
            <div className="mt-4 flex gap-2">
              <Link href="/twin-map" className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold hover:bg-blue-500">
                เปิดผังดิจิทัลทวิน
              </Link>
              <Link href="/inventory" className="rounded-md bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/15">
                จองอะไหล่
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Link key={metric.label} href={metric.href} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md">
              <div className="flex items-center justify-between gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 ${metric.tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <Gauge className="h-4 w-4 text-slate-300" />
              </div>
              <p className="mt-4 text-2xl font-semibold text-slate-950">{metric.value}</p>
              <p className="mt-1 text-sm text-slate-500">{metric.label}</p>
            </Link>
          );
        })}
      </section>

      <DashboardCharts statusData={statusData} usageData={usageData} downtimeData={downtimeData} maintenanceMix={maintenanceMix} />

      <section className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>การแจ้งเตือนล่าสุด</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.slice(0, 5).map((alert) => (
              <Link key={alert.id} href={`/assets/${alert.assetId}`} className="flex items-start justify-between gap-3 rounded-md border border-slate-200 p-3 transition hover:bg-slate-50">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge value={alert.level} />
                    <p className="text-sm font-semibold text-slate-900">{alert.factory.code} · {alert.asset.name}</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{alert.message}</p>
                  <p className="mt-1 text-xs text-slate-400">{formatDateTime(alert.createdAt)}</p>
                </div>
                <TrendingDown className="h-4 w-4 shrink-0 text-slate-400" />
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ใบแจ้งซ่อมล่าสุด</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tickets.slice(0, 5).map((ticket) => (
              <Link key={ticket.id} href={`/tickets/${ticket.id}`} className="flex items-start justify-between gap-3 rounded-md border border-slate-200 p-3 transition hover:bg-slate-50">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-blue-700">{ticket.ticketCode}</p>
                    <StatusBadge value={ticket.status} />
                    <StatusBadge value={ticket.priority} />
                  </div>
                  <p className="mt-2 line-clamp-1 text-sm text-slate-600">{ticket.description}</p>
                  <p className="mt-1 text-xs text-slate-400">{ticket.factory.name} · {ticket.asset.name}</p>
                </div>
                <Wrench className="h-4 w-4 shrink-0 text-slate-400" />
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
