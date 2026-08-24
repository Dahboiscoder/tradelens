import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const offer = await prisma.p2POffer.findUnique({
    where: { id: params.id },
    include: { user: { select: { id: true, name: true } } },
  });
  if (!offer) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ offer });
}

const patchSchema = z.object({ status: z.enum(["COMPLETED", "CANCELLED"]) });

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const offer = await prisma.p2POffer.findUnique({ where: { id: params.id } });
  if (!offer || offer.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid status" }, { status: 400 });

  const updated = await prisma.p2POffer.update({
    where: { id: params.id },
    data: { status: parsed.data.status },
  });

  return NextResponse.json({ offer: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const offer = await prisma.p2POffer.findUnique({ where: { id: params.id } });
  if (!offer || offer.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.p2POffer.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
