"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const palette = ["#2563eb", "#10b981", "#f59e0b", "#ef4444", "#6366f1", "#14b8a6", "#64748b"];

export function DashboardCharts({
  statusData,
  usageData,
  downtimeData,
  maintenanceMix,
}: {
  statusData: { name: string; value: number }[];
  usageData: { name: string; value: number }[];
  downtimeData: { name: string; hours: number }[];
  maintenanceMix: { name: string; value: number }[];
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <ChartFrame title="ใบแจ้งซ่อมตามสถานะ">
        <ResponsiveContainer width="100%" height={230}>
          <BarChart data={statusData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </ChartFrame>
      <ChartFrame title="การใช้อะไหล่ตามหมวด">
        <ResponsiveContainer width="100%" height={230}>
          <PieChart>
            <Pie data={usageData} dataKey="value" nameKey="name" innerRadius={56} outerRadius={88} paddingAngle={3}>
              {usageData.map((entry, index) => (
                <Cell key={entry.name} fill={palette[index % palette.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend iconType="circle" />
          </PieChart>
        </ResponsiveContainer>
      </ChartFrame>
      <ChartFrame title="ชั่วโมงหยุดเครื่องตามโรงงาน">
        <ResponsiveContainer width="100%" height={230}>
          <AreaChart data={downtimeData}>
            <defs>
              <linearGradient id="downtime" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Area type="monotone" dataKey="hours" stroke="#2563eb" fill="url(#downtime)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartFrame>
      <ChartFrame title="งานป้องกันเทียบกับงานซ่อมแก้ไข">
        <ResponsiveContainer width="100%" height={230}>
          <BarChart data={maintenanceMix} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
            <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </ChartFrame>
    </div>
  );
}

export function AssetSensorChart({ readings }: { readings: { capturedAt: string; vibration: number; temperature: number; currentAmp: number; healthScore: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={readings}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey="capturedAt" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="vibration" name="แรงสั่น mm/s" stroke="#ef4444" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="temperature" name="อุณหภูมิ C" stroke="#f59e0b" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="currentAmp" name="กระแส A" stroke="#2563eb" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="healthScore" name="สุขภาพเครื่องจักร" stroke="#10b981" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function AnalyticsCharts({
  kpiTrend,
  capitalData,
}: {
  kpiTrend: { month: string; downtime: number; response: number; compliance: number }[];
  capitalData: { name: string; before: number; after: number }[];
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <ChartFrame title="แนวโน้ม KPI การเดินระบบ">
        <ResponsiveContainer width="100%" height={270}>
          <LineChart data={kpiTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="downtime" name="ชั่วโมงหยุดเครื่อง" stroke="#ef4444" strokeWidth={2} />
            <Line type="monotone" dataKey="response" name="ชั่วโมงตอบสนอง" stroke="#2563eb" strokeWidth={2} />
            <Line type="monotone" dataKey="compliance" name="บำรุงตามแผน %" stroke="#10b981" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </ChartFrame>
      <ChartFrame title="จำลองเงินทุนคงคลัง">
        <ResponsiveContainer width="100%" height={270}>
          <BarChart data={capitalData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="before" name="ก่อนรวมคลัง" fill="#94a3b8" radius={[6, 6, 0, 0]} />
            <Bar dataKey="after" name="หลังรวมคลัง" fill="#10b981" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartFrame>
    </div>
  );
}

function ChartFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="mb-3 text-sm font-semibold text-slate-900">{title}</p>
      {children}
    </div>
  );
}
