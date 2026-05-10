import { cn, labelize } from "@/lib/utils";

const toneMap: Record<string, string> = {
  NORMAL: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  OK: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  AVAILABLE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  LOW: "bg-amber-50 text-amber-700 ring-amber-200",
  WARNING: "bg-amber-50 text-amber-700 ring-amber-200",
  MEDIUM: "bg-amber-50 text-amber-700 ring-amber-200",
  WAITING_FOR_PARTS: "bg-amber-50 text-amber-700 ring-amber-200",
  HIGH: "bg-orange-50 text-orange-700 ring-orange-200",
  CRITICAL: "bg-rose-50 text-rose-700 ring-rose-200",
  EMERGENCY: "bg-rose-50 text-rose-700 ring-rose-200",
  UNDER_MAINTENANCE: "bg-blue-50 text-blue-700 ring-blue-200",
  ASSIGNED: "bg-blue-50 text-blue-700 ring-blue-200",
  IN_PROGRESS: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  APPROVED: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  NEW: "bg-slate-100 text-slate-700 ring-slate-200",
  INFO: "bg-slate-100 text-slate-700 ring-slate-200",
  OFF_DUTY: "bg-slate-100 text-slate-600 ring-slate-200",
  CANCELLED: "bg-slate-100 text-slate-500 ring-slate-200",
  OFFLINE: "bg-slate-100 text-slate-500 ring-slate-200",
};

export function StatusBadge({ value, className }: { value: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        toneMap[value] ?? "bg-slate-100 text-slate-700 ring-slate-200",
        className,
      )}
    >
      {labelize(value)}
    </span>
  );
}
