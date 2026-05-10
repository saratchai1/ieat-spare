import { NextResponse } from "next/server";
import { TicketStatus, TransactionType, TechnicianAvailability } from "@prisma/client";
import { prisma } from "@/lib/db";

type Context = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: Context) {
  const { id } = await context.params;
  const body = await request.json();

  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.maintenanceTicket.findUnique({
      where: { id },
      include: { requestedPart: true, technician: true },
    });

    if (!existing) {
      throw new Error("ไม่พบใบแจ้งซ่อม");
    }

    const data: Record<string, unknown> = {};
    if (body.status) data.status = body.status as TicketStatus;
    if (body.technicianId) {
      data.technicianId = body.technicianId;
      data.assignedAt = new Date();
      if (!body.status && existing.status === TicketStatus.NEW) data.status = TicketStatus.ASSIGNED;
    }
    if (body.usedPartId) data.usedPartId = body.usedPartId;
    if (body.status === TicketStatus.COMPLETED) data.completedAt = new Date();

    const ticket = await tx.maintenanceTicket.update({
      where: { id },
      data,
      include: {
        factory: true,
        asset: true,
        technician: true,
        requestedPart: true,
        usedPart: true,
      },
    });

    if (body.technicianId) {
      await tx.technician.update({
        where: { id: body.technicianId },
        data: {
          availability: TechnicianAvailability.ASSIGNED,
          currentJob: `${existing.ticketCode} - ${existing.description.slice(0, 42)}`,
          workload: { increment: 12 },
        },
      });
    }

    if (body.usedPartId && body.status === TicketStatus.COMPLETED) {
      const part = await tx.sparePart.findUnique({ where: { id: body.usedPartId } });
      if (part && part.currentStock > 0) {
        await tx.sparePart.update({
          where: { id: body.usedPartId },
          data: {
            currentStock: { decrement: 1 },
            reservedStock: part.reservedStock > 0 ? { decrement: 1 } : undefined,
          },
        });
        await tx.inventoryTransaction.create({
          data: {
            sparePartId: body.usedPartId,
            type: TransactionType.STOCK_OUT,
            quantity: 1,
            reference: `ใช้ในใบงาน ${existing.ticketCode}`,
            ticketId: id,
            actor: "ช่างซ่อมบำรุง",
          },
        });
      }
    }

    if (body.note) {
      await tx.workOrderNote.create({
        data: {
          ticketId: id,
          technicianId: ticket.technicianId,
          author: ticket.technician?.name ?? "ผู้ดูแลนิคม",
          content: body.note,
        },
      });
    }

    return ticket;
  });

  return NextResponse.json(result);
}
