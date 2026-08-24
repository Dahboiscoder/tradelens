import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isSupportedExchange } from "@/lib/exchanges";
import { getPlanLimits } from "@/lib/plans";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const items = await prisma.watchlistItem.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ items });
}

const schema = z.object({
  exchange: z.string().trim().toLowerCase(),
  symbol: z.string().trim().toUpperCase(),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const { exchange, symbol } = parsed.data;

  if (!isSupportedExchange(exchange)) {
    return NextResponse.json({ error: `Unsupported exchange: ${exchange}` }, { status: 400 });
  }

  const limit = getPlanLimits(user.plan).maxWatchlist;
  const count = await prisma.watchlistItem.count({ where: { userId: user.id } });
  if (count >= limit) {
    return NextResponse.json(
      { error: `Your ${user.plan} plan allows up to ${limit} watchlist pairs. Upgrade to add more.` },
      { status: 403 }
    );
  }

  try {
    const item = await prisma.watchlistItem.create({ data: { userId: user.id, exchange, symbol } });
    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "That pair is already on your watchlist" }, { status: 409 });
  }
}
