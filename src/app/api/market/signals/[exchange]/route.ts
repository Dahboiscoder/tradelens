import { NextRequest, NextResponse } from "next/server";
import { fetchPublicOHLCV, isSupportedExchange } from "@/lib/exchanges";
import { candlesFromOHLCV, computeSignals } from "@/lib/signals";

export async function GET(req: NextRequest, { params }: { params: { exchange: string } }) {
  const symbol = req.nextUrl.searchParams.get("symbol");
  if (!symbol) return NextResponse.json({ error: "Missing symbol query param" }, { status: 400 });
  if (!isSupportedExchange(params.exchange)) {
    return NextResponse.json({ error: `Unsupported exchange: ${params.exchange}` }, { status: 400 });
  }

  try {
    const ohlcv = await fetchPublicOHLCV(params.exchange, symbol, "1h", 100);
    const candles = candlesFromOHLCV(ohlcv);
    const signal = computeSignals(candles);
    return NextResponse.json({ symbol, exchange: params.exchange, signal, candleCount: candles.length });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not compute signals";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
