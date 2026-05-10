import { NextResponse } from "next/server";
import { TransactionType } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  const body = await request.json();
  const quantity = Math.max(1, Number(body.quantity ?? 1));
  const type = body.type as TransactionType;

  const result = await prisma.$transaction(async (tx) => {
    const part = await tx.sparePart.findUnique({ where: { id: body.sparePartId } });
    if (!part) throw new Error("ไม่พบอะไหล่");

    if (type === TransactionType.STOCK_OUT && part.currentStock < quantity) {
      throw new Error("จำนวนคงคลังไม่เพียงพอ");
    }

    const updatedPart = await tx.sparePart.update({
      where: { id: part.id },
      data: {
        currentStock:
          type === TransactionType.STOCK_IN
            ? { increment: quantity }
            : type === TransactionType.STOCK_OUT
              ? { decrement: quantity }
              : undefined,
      },
    });

    await tx.inventoryTransaction.create({
      data: {
        sparePartId: part.id,
        type,
        quantity,
        reference: body.reference || "รายการคลังอะไหล่",
        actor: "เจ้าหน้าที่คลัง",
      },
    });

    return updatedPart;
  });

  return NextResponse.json(result);
}
