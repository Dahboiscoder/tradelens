import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { decryptSecret } from "@/lib/crypto";
import { fetchAccountBalance } from "@/lib/exchanges";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const connection = await prisma.exchangeConnection.findUnique({ where: { id: params.id } });
  if (!connection || connection.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const apiKey = decryptSecret(connection.encryptedApiKey);
    const apiSecret = decryptSecret(connection.encryptedApiSecret);
    const holdings = await fetchAccountBalance(connection.exchange, apiKey, apiSecret);
    return NextResponse.json({ exchange: connection.exchange, label: connection.label, holdings });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not fetch balance";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
