"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Boxes,
  Building2,
  ClipboardList,
  Factory,
  Map,
  RadioTower,
  Settings2,
  ShieldCheck,
  Truck,
  Users,
  Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "ศูนย์สั่งการ", icon: BarChart3 },
  { href: "/twin-map", label: "ผังดิจิทัลทวิน", icon: Map },
  { href: "/assets", label: "ทะเบียนเครื่องจักร", icon: RadioTower },
  { href: "/inventory", label: "คลังอะไหล่กลาง", icon: Boxes },
  { href: "/tickets", label: "ใบแจ้งซ่อม", icon: ClipboardList },
  { href: "/dispatch", label: "จัดทีมช่าง", icon: Truck },
  { href: "/alerts", label: "การแจ้งเตือน", icon: AlertTriangle },
  { href: "/analytics", label: "มูลค่าทางธุรกิจ", icon: Activity },
];

const roles = [
  { value: "ADMIN", label: "ผู้ดูแลนิคม", icon: ShieldCheck },
  { value: "FACTORY_USER", label: "ผู้ใช้งานโรงงาน", icon: Factory },
  { value: "TECHNICIAN", label: "ช่างซ่อมบำรุง", icon: Wrench },
  { value: "WAREHOUSE", label: "เจ้าหน้าที่คลัง", icon: Building2 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [role, setRole] = useState("ADMIN");

  useEffect(() => {
    const stored = window.localStorage.getItem("demo-role");
    if (stored) window.setTimeout(() => setRole(stored), 0);
  }, []);

  function updateRole(nextRole: string) {
    setRole(nextRole);
    window.localStorage.setItem("demo-role", nextRole);
  }

  const currentRole = roles.find((item) => item.value === role) ?? roles[0];
  const RoleIcon = currentRole.icon;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-slate-950 text-white lg:flex lg:flex-col">
          <div className="border-b border-white/10 px-5 py-5">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-500">
                <Settings2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-wide text-white">อะไหล่แหลมฉบัง</p>
                <p className="text-xs text-slate-400">ซ่อมบำรุงดิจิทัลทวิน</p>
              </div>
            </Link>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white",
                    active && "bg-blue-600 text-white shadow-sm",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-white/10 p-4">
            <div className="rounded-lg bg-white/8 p-3 ring-1 ring-white/10">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Users className="h-4 w-4 text-blue-300" />
                บทบาทเดโม
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {roles.map((item) => {
                  const Icon = item.icon;
                  const selected = item.value === role;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => updateRole(item.value)}
                      className={cn(
                        "flex min-h-16 flex-col items-start justify-between rounded-md border border-white/10 bg-white/5 p-2 text-left text-xs text-slate-300 transition hover:bg-white/10",
                        selected && "border-blue-300 bg-blue-500/20 text-white",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <Link href="/" className="flex items-center gap-2 lg:hidden">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-700 text-white">
                    <Settings2 className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-semibold">อะไหล่แหลมฉบัง</span>
                </Link>
                <div className="hidden min-w-0 sm:block">
                  <p className="truncate text-sm font-semibold text-slate-900">ระบบซ่อมบำรุงดิจิทัลทวิน นิคมอุตสาหกรรมแหลมฉบัง</p>
                  <p className="truncate text-xs text-slate-500">คลังอะไหล่กลาง จัดทีมช่าง แจ้งเตือนล่วงหน้า และสุขภาพเครื่องจักร</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 md:flex">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  ข้อมูลเดโมสด
                </div>
                <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                  <RoleIcon className="h-4 w-4 text-blue-700" />
                  <select
                    value={role}
                    onChange={(event) => updateRole(event.target.value)}
                    className="bg-transparent text-sm font-semibold outline-none"
                    aria-label="ตัวสลับบทบาท"
                  >
                    {roles.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <nav className="flex gap-2 overflow-x-auto border-t border-slate-100 px-4 py-2 lg:hidden">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "inline-flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium text-slate-600",
                      active && "bg-blue-700 text-white",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </header>
          <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
