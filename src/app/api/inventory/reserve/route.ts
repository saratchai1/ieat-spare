import { NextResponse } from "next/server";
import { TicketStatus, TransactionType } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json();
  const quantity = Math.max(1, Number(body.quantity ?? 1));

  const result = await prisma.$transaction(async (tx) => {
    const part = await tx.sparePart.findUnique({ where: { id: body.sparePartId } });
    if (!part) throw new Error("ไม่พบอะไหล่");

    const available = part.currentStock - part.reservedStock;
    if (available < quantity) throw new Error("จำนวนอะไหล่พร้อมใช้ไม่เพียงพอ");

    const updatedPart = await tx.sparePart.update({
      where: { id: part.id },
      data: { reservedStock: { increment: quantity } },
    });

    if (body.ticketId) {
      await tx.maintenanceTicket.update({
        where: { id: body.ticketId },
        data: {
          requestedPartId: part.id,
          status: TicketStatus.WAITING_FOR_PARTS,
        },
      });
    }

    await tx.inventoryTransaction.create({
      data: {
        sparePartId: part.id,
        type: TransactionType.RESERVE,
        quantity,
        reference: body.ticketCode ? `จองสำหรับ ${body.ticketCode}` : "จองอะไหล่ด้วยตนเอง",
        ticketId: body.ticketId || null,
        actor: "เจ้าหน้าที่คลัง",
      },
    });

    return updatedPart;
  });

  return NextResponse.json(result);
}
