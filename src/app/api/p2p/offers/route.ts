import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const asset = req.nextUrl.searchParams.get("asset")?.toUpperCase();

  const offers = await prisma.p2POffer.findMany({
    where: { status: "OPEN", ...(asset ? { asset } : {}) },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { user: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ offers });
}

const schema = z.object({
  side: z.enum(["BUY", "SELL"]),
  asset: z.string().trim().toUpperCase().min(1).max(10),
  amount: z.number().positive(),
  fiatCurrency: z.string().trim().toUpperCase().min(1).max(10),
  pricePerUnit: z.number().positive(),
  paymentMethod: z.string().trim().min(1).max(100),
  notes: z.string().trim().max(500).optional(),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid offer", details: parsed.error.flatten() }, { status: 400 });
  }

  const offer = await prisma.p2POffer.create({
    data: { userId: user.id, ...parsed.data },
    include: { user: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ offer }, { status: 201 });
}
