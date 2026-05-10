import { NextResponse } from "next/server";
import { MaintenanceType, TicketPriority, TicketStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json();
  const count = await prisma.maintenanceTicket.count();
  const ticket = await prisma.maintenanceTicket.create({
    data: {
      ticketCode: `MT-${String(count + 1).padStart(4, "0")}`,
      factoryId: body.factoryId,
      assetId: body.assetId,
      description: body.description,
      priority: (body.priority ?? TicketPriority.MEDIUM) as TicketPriority,
      status: TicketStatus.NEW,
      maintenanceType: (body.maintenanceType ?? MaintenanceType.CORRECTIVE) as MaintenanceType,
      preferredServiceTime: body.preferredServiceTime ? new Date(body.preferredServiceTime) : null,
      requestedPartId: body.requestedPartId || null,
      downtimeHours: Number(body.downtimeHours ?? 0),
      estimatedHours: Number(body.estimatedHours ?? 2),
    },
  });

  await prisma.workOrderNote.create({
    data: {
      ticketId: ticket.id,
      author: "ผู้ใช้งานโรงงาน",
      content: "ส่งคำขอซ่อมผ่านพอร์ทัลเดโมเรียบร้อย",
    },
  });

  return NextResponse.json(ticket, { status: 201 });
}
