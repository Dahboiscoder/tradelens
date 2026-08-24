import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const threads = await prisma.p2PThread.findMany({
    where: { OR: [{ ownerId: user.id }, { counterpartyId: user.id }] },
    orderBy: { createdAt: "desc" },
    include: {
      offer: { select: { id: true, side: true, asset: true, amount: true, fiatCurrency: true, pricePerUnit: true, status: true } },
      owner: { select: { id: true, name: true } },
      counterparty: { select: { id: true, name: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return NextResponse.json({ threads });
}
