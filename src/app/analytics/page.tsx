import { ArrowDownRight, Clock, PackageCheck, PiggyBank, ShieldCheck, Wrench } from "lucide-react";
import { AnalyticsCharts } from "@/components/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

export default function AnalyticsPage() {
  const kpis = [
    { label: "ลดต้นทุนสินค้าคงคลัง", value: "31%", icon: PiggyBank, detail: "คลังอะไหล่กลางลดการเก็บอะไหล่กันชนซ้ำซ้อนของแต่ละโรงงาน" },
    { label: "ลดเวลาหยุดเครื่อง", value: "24%", icon: ArrowDownRight, detail: "การแจ้งเตือนล่วงหน้าช่วยจองอะไหล่ก่อนเข้าใกล้จุดเสียหาย" },
    { label: "เวลาตอบสนองเฉลี่ย", value: "2.7 ชม.", icon: Clock, detail: "ศูนย์จัดทีมเลือกช่างที่เหมาะสมและอยู่ใกล้พื้นที่งานที่สุด" },
    { label: "รอบหมุนเวียนอะไหล่", value: "4.8 เท่า", icon: PackageCheck, detail: "การรวมสต็อกระดับนิคมทำให้อะไหล่มูลค่าสูงถูกใช้คุ้มค่าขึ้น" },
    { label: "บำรุงตามแผน", value: "92%", icon: ShieldCheck, detail: "ตารางดิจิทัลทวินช่วยคุมเครื่องจักรสำคัญให้อยู่ในรอบบำรุงรักษา" },
    { label: "ประสิทธิภาพทีมช่างร่วม", value: "18%", icon: Wrench, detail: "การกระจายภาระงานลดเวลาว่างและลด OT งานฉุกเฉิน" },
  ];

  const kpiTrend = [
    { month: "ม.ค.", downtime: 42, response: 5.2, compliance: 76 },
    { month: "ก.พ.", downtime: 37, response: 4.6, compliance: 80 },
    { month: "มี.ค.", downtime: 31, response: 3.8, compliance: 84 },
    { month: "เม.ย.", downtime: 28, response: 3.2, compliance: 88 },
    { month: "พ.ค.", downtime: 24, response: 2.7, compliance: 92 },
  ];

  const capitalData = [
    { name: "ตลับลูกปืน", before: 4.8, after: 3.1 },
    { name: "มอเตอร์", before: 8.6, after: 5.9 },
    { name: "เซนเซอร์", before: 3.4, after: 2.5 },
    { name: "ไส้กรอง", before: 2.2, after: 1.6 },
    { name: "ไฟฟ้า", before: 5.1, after: 3.7 },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">มูลค่าทางธุรกิจ</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">เศรษฐศาสตร์บริการซ่อมบำรุงรวมศูนย์</h1>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">
          การรวมอะไหล่และทีมช่างระดับนิคมแหลมฉบังช่วยเปลี่ยนงานซ่อมของแต่ละโรงงานให้เป็นบริการกลางที่วัดผลได้ทั้งเงินทุน เวลาหยุดเครื่อง และเวลาตอบสนอง
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label}>
              <CardContent>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-3xl font-semibold text-slate-950">{kpi.value}</p>
                </div>
                <p className="mt-4 text-sm font-semibold text-slate-900">{kpi.label}</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">{kpi.detail}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <AnalyticsCharts kpiTrend={kpiTrend} capitalData={capitalData} />

      <Card>
        <CardHeader>
          <CardTitle>สารหลักสำหรับนำเสนอผู้บริหาร</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <ValuePoint title="คลังกลางแห่งเดียวของนิคม" text="ทุกโรงงานเบิกจากสต็อกที่บริหารร่วมกัน ลดอะไหล่ซ้ำซ้อนและลดการซื้อฉุกเฉิน" />
          <ValuePoint title="วงจรซ่อมล่วงหน้าจากเซนเซอร์" text="สัญญาณเตือนสร้างใบงาน จองอะไหล่ และจัดช่างก่อนเวลาหยุดเครื่องบานปลาย" />
          <ValuePoint title="โมเดลบริการของผู้พัฒนานิคม" text="ผู้บริหารนิคมสามารถต่อยอดเป็นบริการซ่อมบำรุงร่วมแบบ recurring service ให้ผู้เช่าโรงงาน" />
        </CardContent>
      </Card>
    </div>
  );
}

function ValuePoint({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{text}</p>
    </div>
  );
}
