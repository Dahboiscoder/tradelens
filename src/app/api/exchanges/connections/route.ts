import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { encryptSecret } from "@/lib/crypto";
import { isSupportedExchange, verifyConnection } from "@/lib/exchanges";
import { getPlanLimits } from "@/lib/plans";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const connections = await prisma.exchangeConnection.findMany({
    where: { userId: user.id },
    select: { id: true, exchange: true, label: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ connections });
}

const schema = z.object({
  exchange: z.string().trim().toLowerCase(),
  label: z.string().trim().min(1).max(60),
  apiKey: z.string().trim().min(1),
  apiSecret: z.string().trim().min(1),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
  }
  const { exchange, label, apiKey, apiSecret } = parsed.data;

  if (!isSupportedExchange(exchange)) {
    return NextResponse.json({ error: `Unsupported exchange: ${exchange}` }, { status: 400 });
  }

  const limit = getPlanLimits(user.plan).maxConnections;
  const count = await prisma.exchangeConnection.count({ where: { userId: user.id } });
  if (count >= limit) {
    return NextResponse.json(
      { error: `Your ${user.plan} plan allows up to ${limit} exchange connection(s). Upgrade to add more.` },
      { status: 403 }
    );
  }

  try {
    // Fail fast if the credentials don't actually work, rather than saving dead keys.
    await verifyConnection(exchange, apiKey, apiSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not verify credentials";
    return NextResponse.json(
      { error: `Couldn't connect to ${exchange} with those credentials: ${message}` },
      { status: 400 }
    );
  }

  const connection = await prisma.exchangeConnection.create({
    data: {
      userId: user.id,
      exchange,
      label,
      encryptedApiKey: encryptSecret(apiKey),
      encryptedApiSecret: encryptSecret(apiSecret),
    },
    select: { id: true, exchange: true, label: true, createdAt: true },
  });

  return NextResponse.json({ connection }, { status: 201 });
}
