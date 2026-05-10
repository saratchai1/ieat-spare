"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  ChevronRight,
  Factory,
  Gauge,
  MapPinned,
  Wrench,
} from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { cn } from "@/lib/utils";

type FactoryMapItem = {
  id: string;
  code: string;
  name: string;
  zone: string;
  status: string;
  riskLevel: number;
  description: string;
  x: number;
  y: number;
  activeTickets: number;
  partRequests: number;
  criticalAlerts: number;
  mainAssets: { id: string; assetCode: string; name: string; status: string; healthScore: number }[];
};

const statusStyles: Record<string, { block: string; dot: string; ring: string }> = {
  NORMAL: {
    block: "border-emerald-500 bg-emerald-50",
    dot: "bg-emerald-500",
    ring: "ring-emerald-200",
  },
  WARNING: {
    block: "border-amber-500 bg-amber-50",
    dot: "bg-amber-500",
    ring: "ring-amber-200",
  },
  CRITICAL: {
    block: "border-rose-500 bg-rose-50",
    dot: "bg-rose-500",
    ring: "ring-rose-200",
  },
  UNDER_MAINTENANCE: {
    block: "border-blue-500 bg-blue-50",
    dot: "bg-blue-500",
    ring: "ring-blue-200",
  },
};

const factoryShapes: Record<string, { left: string; top: string; width: string; height: string; rotate: string }> = {
  "F-A": { left: "31%", top: "35%", width: "clamp(6.8rem, 17%, 12rem)", height: "clamp(4.4rem, 11%, 6.4rem)", rotate: "-4deg" },
  "F-B": { left: "57%", top: "34%", width: "clamp(7.1rem, 18%, 12.5rem)", height: "clamp(4.6rem, 11%, 6.6rem)", rotate: "-4deg" },
  "F-C": { left: "41%", top: "55%", width: "clamp(6.8rem, 17%, 12rem)", height: "clamp(4.5rem, 11%, 6.5rem)", rotate: "-4deg" },
  "F-D": { left: "65%", top: "55%", width: "clamp(7rem, 17.5%, 12.2rem)", height: "clamp(4.4rem, 11%, 6.4rem)", rotate: "-4deg" },
  "F-E": { left: "34%", top: "74%", width: "clamp(7rem, 17.5%, 12.2rem)", height: "clamp(4.5rem, 11%, 6.5rem)", rotate: "-4deg" },
};

export function TwinMapClient({ factories }: { factories: FactoryMapItem[] }) {
  const [selectedId, setSelectedId] = useState(factories.find((factory) => factory.status === "CRITICAL")?.id ?? factories[0]?.id);
  const selected = useMemo(() => factories.find((factory) => factory.id === selectedId) ?? factories[0], [factories, selectedId]);

  return (
    <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
      <section className="min-w-0 space-y-3">
        <div className="relative min-h-[640px] min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="absolute inset-0 bg-[#e7edf0]" />
          <MapIllustration />

          <div className="absolute left-5 top-5 z-20 max-w-md rounded-lg border border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
              <MapPinned className="h-4 w-4 text-blue-700" />
              ผังดิจิทัลทวินนิคมแหลมฉบัง
            </div>
            <p className="mt-1 text-xs leading-5 text-slate-500">แปลงโรงงาน ถนนหลัก คลังอะไหล่กลาง รางรถไฟ และแนวท่าเรือในมุมมองเดียว</p>
          </div>

          <div className="absolute right-5 top-5 z-20 hidden flex-wrap gap-2 rounded-lg border border-slate-200 bg-white/95 p-3 text-xs shadow-sm backdrop-blur md:flex">
            <LegendItem color="bg-emerald-500" label="ปกติ" />
            <LegendItem color="bg-amber-500" label="เฝ้าระวัง" />
            <LegendItem color="bg-rose-500" label="วิกฤต" />
            <LegendItem color="bg-blue-500" label="กำลังซ่อม" />
          </div>

          <div className="absolute bottom-5 left-5 z-20 rounded-lg border border-slate-200 bg-white/90 px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm backdrop-blur">
            ทางเชื่อมคลังกลาง → โรงงาน B · ประมาณ 12 นาที
          </div>

          {factories.map((factory) => (
            <FactoryBlock
              key={factory.id}
              factory={factory}
              active={factory.id === selected?.id}
              onSelect={() => setSelectedId(factory.id)}
            />
          ))}
        </div>

        <div className="grid min-w-0 gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm md:grid-cols-3 xl:grid-cols-5">
          {factories.map((factory) => {
            const active = factory.id === selected?.id;
            const styles = statusStyles[factory.status] ?? statusStyles.NORMAL;
            return (
              <button
                key={factory.id}
                type="button"
                onClick={() => setSelectedId(factory.id)}
                className={cn(
                  "min-w-0 rounded-lg border bg-white/95 p-3 text-left shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md",
                  active && "border-blue-500 ring-4 ring-blue-100",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", styles.dot)} />
                    <span className="truncate text-sm font-semibold text-slate-950">{factory.code}</span>
                  </span>
                  {factory.criticalAlerts > 0 ? <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" /> : null}
                </div>
                <p className="mt-1 truncate text-xs text-slate-500">{factory.name}</p>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-slate-500">ความเสี่ยง {factory.riskLevel}</span>
                  <StatusBadge value={factory.status} />
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <aside className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">{selected.zone}</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-950">{selected.name}</h2>
            </div>
            <StatusBadge value={selected.status} />
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-500">{selected.description}</p>
        </div>
        <div className="grid grid-cols-3 border-b border-slate-100">
          <Metric icon={<Gauge className="h-4 w-4" />} label="ความเสี่ยง" value={selected.riskLevel} />
          <Metric icon={<Wrench className="h-4 w-4" />} label="ใบงาน" value={selected.activeTickets} />
          <Metric icon={<Boxes className="h-4 w-4" />} label="คำขออะไหล่" value={selected.partRequests} />
        </div>
        <div className="p-5">
          <p className="text-sm font-semibold text-slate-900">เครื่องจักรหลัก</p>
          <div className="mt-3 space-y-2">
            {selected.mainAssets.map((asset) => (
              <Link
                key={asset.id}
                href={`/assets/${asset.id}`}
                className="flex items-center justify-between gap-3 rounded-md border border-slate-200 p-3 transition hover:border-blue-300 hover:bg-blue-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{asset.name}</p>
                  <p className="text-xs text-slate-500">{asset.assetCode} · สุขภาพ {asset.healthScore}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge value={asset.status} />
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <Link
              href={`/tickets?factory=${selected.id}`}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-800"
            >
              <Wrench className="h-4 w-4" />
              ใบแจ้งซ่อม
            </Link>
            <Link
              href="/inventory"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Boxes className="h-4 w-4" />
              คลังกลาง
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}

function MapIllustration() {
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1120 690" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <pattern id="lots" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#cbd5e1" strokeWidth="1" opacity="0.55" />
        </pattern>
        <linearGradient id="water" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#bae6fd" />
          <stop offset="55%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#5eead4" />
        </linearGradient>
        <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#0f172a" floodOpacity="0.12" />
        </filter>
      </defs>

      <rect width="1120" height="690" fill="#e8eef1" />
      <path d="M0 90 C170 125 260 90 388 96 C540 102 680 155 1120 112 L1120 0 L0 0Z" fill="#dce8dd" />
      <path d="M0 600 C180 554 315 570 502 610 C710 656 878 620 1120 540 L1120 690 L0 690Z" fill="url(#water)" />
      <path d="M0 118 L1120 145" fill="none" stroke="#f8fafc" strokeWidth="42" />
      <path d="M0 118 L1120 145" fill="none" stroke="#94a3b8" strokeWidth="48" opacity="0.4" />
      <path d="M0 118 L1120 145" fill="none" stroke="#f8fafc" strokeWidth="38" />
      <path d="M0 118 L1120 145" fill="none" stroke="#16a34a" strokeWidth="8" opacity="0.85" />
      <path d="M398 0 L342 690" fill="none" stroke="#94a3b8" strokeWidth="58" opacity="0.45" />
      <path d="M398 0 L342 690" fill="none" stroke="#f8fafc" strokeWidth="46" />
      <path d="M398 0 L342 690" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="18 18" />
      <path d="M140 565 C280 485 455 482 644 520 C800 552 942 526 1120 474" fill="none" stroke="#94a3b8" strokeWidth="52" opacity="0.45" />
      <path d="M140 565 C280 485 455 482 644 520 C800 552 942 526 1120 474" fill="none" stroke="#f8fafc" strokeWidth="40" />
      <path d="M140 565 C280 485 455 482 644 520 C800 552 942 526 1120 474" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="18 18" />
      <path d="M40 352 L1090 262" fill="none" stroke="#f8fafc" strokeWidth="34" />
      <path d="M40 352 L1090 262" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="14 14" />

      <rect x="70" y="170" width="930" height="355" rx="22" fill="url(#lots)" opacity="0.7" />
      <path d="M110 170 L968 144 L1015 500 L145 525Z" fill="#f8fafc" opacity="0.28" />

      <g filter="url(#softShadow)">
        <rect x="760" y="405" width="180" height="92" rx="10" fill="#1d4ed8" opacity="0.94" />
        <rect x="775" y="421" width="150" height="58" rx="6" fill="#60a5fa" opacity="0.65" />
        <text x="850" y="458" textAnchor="middle" fill="#ffffff" fontSize="18" fontWeight="700">
          คลังอะไหล่กลาง
        </text>
      </g>

      <g opacity="0.82">
        <rect x="962" y="450" width="86" height="32" rx="4" fill="#475569" />
        <rect x="944" y="492" width="104" height="34" rx="4" fill="#64748b" />
        <rect x="1000" y="535" width="76" height="26" rx="4" fill="#475569" />
      </g>

      <g transform="translate(66 534)" opacity="0.85">
        {Array.from({ length: 6 }).map((_, index) => (
          <circle key={index} cx={(index % 3) * 42} cy={Math.floor(index / 3) * 42} r="16" fill="#f8fafc" stroke="#94a3b8" strokeWidth="5" />
        ))}
      </g>

      <path d="M22 490 C145 462 220 427 325 418 C440 408 530 442 645 430" fill="none" stroke="#334155" strokeWidth="5" strokeDasharray="12 10" opacity="0.55" />
    </svg>
  );
}

function FactoryBlock({
  factory,
  active,
  onSelect,
}: {
  factory: FactoryMapItem;
  active: boolean;
  onSelect: () => void;
}) {
  const shape = factoryShapes[factory.code] ?? factoryShapes["F-A"];
  const styles = statusStyles[factory.status] ?? statusStyles.NORMAL;
  const shortName = factory.name
    .replace(/^โรงงาน\s+[A-Z]\s+-\s+/, "")
    .replace("แหลมฉบัง", "")
    .trim();

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group absolute z-10 overflow-hidden rounded-lg border-2 p-2 text-left shadow-md transition hover:-translate-y-0.5 hover:shadow-xl",
        styles.block,
        active && "z-20 border-blue-600 bg-white shadow-xl ring-4 ring-blue-100",
      )}
      style={{
        left: shape.left,
        top: shape.top,
        width: shape.width,
        height: shape.height,
        transform: `translate(-50%, -50%) rotate(${shape.rotate})`,
      }}
      aria-label={`เลือก ${factory.name}`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.66)_42%,rgba(148,163,184,0.22)_42%,rgba(148,163,184,0.22)_52%,rgba(255,255,255,0.7)_52%)]" />
      <div className="absolute inset-x-2 top-2 h-2 rounded-full bg-white/70" />
      <div className="absolute bottom-2 right-2 h-5 w-12 rounded bg-slate-900/10" />
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Factory className="h-3.5 w-3.5 shrink-0 text-slate-700" />
              <p className="truncate text-sm font-black text-slate-950">{factory.code}</p>
            </div>
            <p className="mt-1 truncate text-[11px] font-semibold leading-4 text-slate-700">{shortName}</p>
          </div>
          <span className={cn("h-3 w-3 shrink-0 rounded-full ring-4", styles.dot, styles.ring)} />
        </div>
        <div className="space-y-1.5">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/80">
            <div className={cn("h-full rounded-full", styles.dot)} style={{ width: `${Math.min(factory.riskLevel, 100)}%` }} />
          </div>
          <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-slate-700">
            <span>เสี่ยง {factory.riskLevel}</span>
          {factory.criticalAlerts > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-1.5 py-0.5 text-white">
              <AlertTriangle className="h-3 w-3" />
              วิกฤต
            </span>
          ) : (
              <span className="rounded-full bg-white/80 px-1.5 py-0.5">ใบงาน {factory.activeTickets}</span>
          )}
          </div>
        </div>
      </div>
    </button>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-slate-600">
      <span className={cn("h-2.5 w-2.5 rounded-full", color)} />
      {label}
    </span>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="border-r border-slate-100 p-4 last:border-r-0">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}
