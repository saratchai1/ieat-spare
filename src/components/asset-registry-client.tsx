"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CalendarClock, Factory, Search } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle, Input, Select } from "@/components/ui";
import { formatDate, labelize } from "@/lib/utils";

type FactoryOption = { id: string; name: string };
type AssetRow = {
  id: string;
  assetCode: string;
  factoryId: string;
  factoryCode: string;
  name: string;
  type: string;
  brandModel: string;
  operatingHours: number;
  healthScore: number;
  lastMaintenanceAt: string;
  nextPmAt: string;
  criticality: string;
  status: string;
};

export function AssetRegistryClient({ assets, factories }: { assets: AssetRow[]; factories: FactoryOption[] }) {
  const [query, setQuery] = useState("");
  const [factoryId, setFactoryId] = useState("ALL");
  const [status, setStatus] = useState("ALL");

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesQuery = `${asset.assetCode} ${asset.name} ${asset.brandModel} ${asset.factoryCode}`.toLowerCase().includes(query.toLowerCase());
      const matchesFactory = factoryId === "ALL" || asset.factoryId === factoryId;
      const matchesStatus = status === "ALL" || asset.status === status;
      return matchesQuery && matchesFactory && matchesStatus;
    });
  }, [assets, query, factoryId, status]);

  return (
    <>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">ทะเบียนเครื่องจักรโรงงาน</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">เครื่องจักรดิจิทัลทวินในนิคมแหลมฉบัง</h1>
        </div>
        <div className="grid gap-2 sm:grid-cols-[220px_180px_160px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="ค้นหาเครื่องจักร" className="pl-9" />
          </div>
          <Select value={factoryId} onChange={(event) => setFactoryId(event.target.value)}>
            <option value="ALL">ทุกโรงงาน</option>
            {factories.map((factory) => (
              <option key={factory.id} value={factory.id}>{factory.name}</option>
            ))}
          </Select>
          <Select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="ALL">ทุกสถานะ</option>
            <option value="NORMAL">ปกติ</option>
            <option value="WARNING">เฝ้าระวัง</option>
            <option value="CRITICAL">วิกฤต</option>
            <option value="UNDER_MAINTENANCE">กำลังซ่อม</option>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>สุขภาพเครื่องจักรและแผนบำรุงเชิงป้องกัน</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">เครื่องจักร</th>
                <th className="px-5 py-3">โรงงาน</th>
                <th className="px-5 py-3">ประเภท</th>
                <th className="px-5 py-3">ยี่ห้อ / รุ่น</th>
                <th className="px-5 py-3">ชั่วโมงเดินเครื่อง</th>
                <th className="px-5 py-3">สุขภาพ</th>
                <th className="px-5 py-3">ซ่อมล่าสุด</th>
                <th className="px-5 py-3">บำรุงครั้งถัดไป</th>
                <th className="px-5 py-3">ความสำคัญ</th>
                <th className="px-5 py-3">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <Link href={`/assets/${asset.id}`} className="font-semibold text-blue-700 hover:text-blue-900">
                      {asset.name}
                    </Link>
                    <p className="text-xs text-slate-500">{asset.assetCode}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    <span className="inline-flex items-center gap-1"><Factory className="h-4 w-4" />{asset.factoryCode}</span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{labelize(asset.type)}</td>
                  <td className="px-5 py-4 text-slate-600">{asset.brandModel}</td>
                  <td className="px-5 py-4 text-slate-600">{asset.operatingHours.toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <div className="flex min-w-32 items-center gap-2">
                      <div className="h-2 flex-1 rounded-full bg-slate-100">
                        <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${asset.healthScore}%` }} />
                      </div>
                      <span className="text-sm font-semibold text-slate-900">{asset.healthScore}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{formatDate(asset.lastMaintenanceAt)}</td>
                  <td className="px-5 py-4 text-slate-600">
                    <span className="inline-flex items-center gap-1"><CalendarClock className="h-4 w-4" />{formatDate(asset.nextPmAt)}</span>
                  </td>
                  <td className="px-5 py-4"><StatusBadge value={asset.criticality} /></td>
                  <td className="px-5 py-4"><StatusBadge value={asset.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </>
  );
}
