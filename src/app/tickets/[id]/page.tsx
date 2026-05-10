import { notFound } from "next/navigation";
import { Camera, Clock3, Factory, PackageCheck, UserRound } from "lucide-react";
import { TicketActions } from "@/components/ticket-actions";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle, EmptyState } from "@/components/ui";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDateTime, labelize } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function TicketDetailPage({ params }: Props) {
  const { id } = await params;
  const [ticket, technicians, parts] = await Promise.all([
    prisma.maintenanceTicket.findUnique({
      where: { id },
      include: {
        factory: true,
        asset: true,
        technician: true,
        requestedPart: true,
        usedPart: true,
        notes: { include: { technician: true }, orderBy: { createdAt: "desc" } },
      },
    }),
    prisma.technician.findMany({ orderBy: [{ availability: "asc" }, { workload: "asc" }] }),
    prisma.sparePart.findMany({ orderBy: { partCode: "asc" } }),
  ]);

  if (!ticket) notFound();

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">{ticket.ticketCode}</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">{ticket.asset.name}</h1>
          <p className="mt-1 text-sm text-slate-500">{ticket.factory.name} · งาน{labelize(ticket.maintenanceType)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge value={ticket.priority} />
          <StatusBadge value={ticket.status} />
        </div>
      </div>

      <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>รายละเอียดปัญหา</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-7 text-slate-700">{ticket.description}</p>
              <div className="mt-5 grid gap-3 md:grid-cols-4">
                <Info icon={<Factory className="h-4 w-4" />} label="โรงงาน" value={ticket.factory.name} />
                <Info icon={<Clock3 className="h-4 w-4" />} label="ประเมินเวลา" value={`${ticket.estimatedHours} ชม.`} />
                <Info icon={<UserRound className="h-4 w-4" />} label="ช่าง" value={ticket.technician?.name ?? "ยังไม่มอบหมาย"} />
                <Info icon={<PackageCheck className="h-4 w-4" />} label="อะไหล่ที่ขอ" value={ticket.requestedPart?.partCode ?? "-"} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>อะไหล่</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <PartBlock title="อะไหล่ที่ขอ" part={ticket.requestedPart} />
              <PartBlock title="อะไหล่ที่ใช้จริง" part={ticket.usedPart} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>รูปภาพประกอบ</CardTitle>
            </CardHeader>
            <CardContent>
              <EmptyState icon={<Camera className="h-8 w-8" />} title="พื้นที่แนบรูปภาพ" description="ระบบจริงสามารถแนบรูปหน้างาน ภาพความร้อน หรือหลักฐานก่อนและหลังซ่อมได้" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ไทม์ไลน์สถานะและบันทึกงาน</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ticket.notes.map((note) => (
                <div key={note.id} className="rounded-md border border-slate-200 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">{note.author}</p>
                    <p className="text-xs text-slate-400">{formatDateTime(note.createdAt)}</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{note.content}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <TicketActions
          ticketId={ticket.id}
          currentStatus={ticket.status}
          requestedPartId={ticket.requestedPartId}
          technicians={technicians.map((tech) => ({
            id: tech.id,
            name: tech.name,
            skillType: tech.skillType,
            availability: tech.availability,
          }))}
          parts={parts.map((part) => ({
            id: part.id,
            partCode: part.partCode,
            name: part.name,
          }))}
        />
      </section>
    </div>
  );
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">{icon}{label}</div>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function PartBlock({
  title,
  part,
}: {
  title: string;
  part?: { partCode: string; name: string; currentStock: number; reservedStock: number; unitPrice: number; warehouseLocation: string } | null;
}) {
  if (!part) {
    return (
      <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-slate-500">{title}</p>
        <p className="mt-2 text-sm text-slate-400">ยังไม่มีการบันทึกอะไหล่</p>
      </div>
    );
  }
  return (
    <div className="rounded-md border border-slate-200 p-4">
      <p className="text-sm font-semibold text-slate-500">{title}</p>
      <p className="mt-2 text-base font-semibold text-slate-950">{part.name}</p>
      <p className="mt-1 text-sm text-slate-500">{part.partCode} · {part.warehouseLocation}</p>
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-500">
        <span>คงคลัง {part.currentStock}</span>
        <span>จอง {part.reservedStock}</span>
        <span>{formatCurrency(part.unitPrice)}</span>
      </div>
    </div>
  );
}
