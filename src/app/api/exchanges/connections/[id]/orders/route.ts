import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { decryptSecret } from "@/lib/crypto";
import { placeOrder } from "@/lib/exchanges";

const schema = z
  .object({
    symbol: z.string().trim().toUpperCase(),
    side: z.enum(["BUY", "SELL"]),
    type: z.enum(["MARKET", "LIMIT"]),
    amount: z.number().positive(),
    price: z.number().positive().optional(),
    // Required so this endpoint can never fire from a stray/automated request — the
    // dashboard only sends confirm:true after the user has seen the review step.
    confirm: z.literal(true),
  })
  .refine((data) => data.type === "MARKET" || data.price !== undefined, {
    message: "price is required for LIMIT orders",
    path: ["price"],
  });

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const connection = await prisma.exchangeConnection.findUnique({ where: { id: params.id } });
  if (!connection || connection.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const orders = await prisma.order.findMany({
    where: { connectionId: connection.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json({ orders });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const connection = await prisma.exchangeConnection.findUnique({ where: { id: params.id } });
  if (!connection || connection.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid order", details: parsed.error.flatten() }, { status: 400 });
  }
  const { symbol, side, type, amount, price } = parsed.data;

  try {
    const apiKey = decryptSecret(connection.encryptedApiKey);
    const apiSecret = decryptSecret(connection.encryptedApiSecret);

    const result = await placeOrder({
      exchangeId: connection.exchange,
      apiKey,
      apiSecret,
      symbol,
      side,
      type,
      amount,
      price,
    });

    const order = await prisma.order.create({
      data: {
        userId: user.id,
        connectionId: connection.id,
        exchange: connection.exchange,
        symbol,
        side,
        type,
        amount,
        price: price ?? null,
        status: result.status === "closed" ? "FILLED" : "PENDING",
        exchangeOrderId: result.id,
      },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Order failed";
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        connectionId: connection.id,
        exchange: connection.exchange,
        symbol,
        side,
        type,
        amount,
        price: price ?? null,
        status: "FAILED",
        errorMessage: message,
      },
    });
    return NextResponse.json({ error: message, order }, { status: 502 });
  }
}
