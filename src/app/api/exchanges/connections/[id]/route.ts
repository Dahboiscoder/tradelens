import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const connection = await prisma.exchangeConnection.findUnique({ where: { id: params.id } });
  if (!connection || connection.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.exchangeConnection.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
