import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

async function assertParticipant(threadId: string, userId: string) {
  const thread = await prisma.p2PThread.findUnique({ where: { id: threadId } });
  if (!thread || (thread.ownerId !== userId && thread.counterpartyId !== userId)) return null;
  return thread;
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const thread = await assertParticipant(params.id, user.id);
  if (!thread) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const messages = await prisma.p2PMessage.findMany({
    where: { threadId: params.id },
    orderBy: { createdAt: "asc" },
    include: { sender: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ messages });
}

const schema = z.object({ body: z.string().trim().min(1).max(2000) });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const thread = await assertParticipant(params.id, user.id);
  if (!thread) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Message can't be empty" }, { status: 400 });

  const message = await prisma.p2PMessage.create({
    data: { threadId: thread.id, senderId: user.id, body: parsed.data.body },
    include: { sender: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ message }, { status: 201 });
}
