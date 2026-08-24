import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

// Opens (or returns the existing) conversation between the current user and the offer's
// owner. Only the offer owner and this one counterparty can ever see it — see the
// unique([offerId, counterpartyId]) constraint in the schema.
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const offer = await prisma.p2POffer.findUnique({ where: { id: params.id } });
  if (!offer) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (offer.userId === user.id) {
    return NextResponse.json({ error: "You can't message your own offer" }, { status: 400 });
  }

  const thread = await prisma.p2PThread.upsert({
    where: { offerId_counterpartyId: { offerId: offer.id, counterpartyId: user.id } },
    update: {},
    create: { offerId: offer.id, ownerId: offer.userId, counterpartyId: user.id },
  });

  return NextResponse.json({ thread }, { status: 201 });
}
