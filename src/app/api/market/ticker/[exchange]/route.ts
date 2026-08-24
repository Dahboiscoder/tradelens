import { NextRequest, NextResponse } from "next/server";
import { fetchPublicTicker, isSupportedExchange } from "@/lib/exchanges";

export async function GET(req: NextRequest, { params }: { params: { exchange: string } }) {
  const symbol = req.nextUrl.searchParams.get("symbol");
  if (!symbol) return NextResponse.json({ error: "Missing symbol query param" }, { status: 400 });
  if (!isSupportedExchange(params.exchange)) {
    return NextResponse.json({ error: `Unsupported exchange: ${params.exchange}` }, { status: 400 });
  }

  try {
    const ticker = await fetchPublicTicker(params.exchange, symbol);
    return NextResponse.json({
      symbol: ticker.symbol,
      last: ticker.last,
      bid: ticker.bid,
      ask: ticker.ask,
      high: ticker.high,
      low: ticker.low,
      changePercent: ticker.percentage,
      baseVolume: ticker.baseVolume,
      timestamp: ticker.timestamp,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not fetch ticker";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
