import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const thread = await prisma.p2PThread.findUnique({
    where: { id: params.id },
    include: {
      offer: true,
      owner: { select: { id: true, name: true } },
      counterparty: { select: { id: true, name: true } },
    },
  });
  if (!thread || (thread.ownerId !== user.id && thread.counterpartyId !== user.id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ thread });
}
