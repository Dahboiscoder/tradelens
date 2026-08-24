import { RSI, SMA, EMA, MACD } from "technicalindicators";

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// ccxt types each OHLCV field as possibly undefined (exchange-dependent); drop any
// incomplete candle rather than silently computing indicators on gapped data.
export function candlesFromOHLCV(ohlcv: Array<Array<number | undefined>>): Candle[] {
  const candles: Candle[] = [];
  for (const [time, open, high, low, close, volume] of ohlcv) {
    if (
      time === undefined ||
      open === undefined ||
      high === undefined ||
      low === undefined ||
      close === undefined ||
      volume === undefined
    ) {
      continue;
    }
    candles.push({ time, open, high, low, close, volume });
  }
  return candles;
}

export interface SignalResult {
  rsi: number | null;
  sma20: number | null;
  ema20: number | null;
  macd: { MACD?: number; signal?: number; histogram?: number } | null;
  label: "bullish-lean" | "bearish-lean" | "neutral";
  explanation: string;
}

// Deliberately plain technical-analysis math over real historical candles — RSI, SMA/EMA,
// MACD crossover — combined into a simple majority vote. No proprietary "AI model", no
// return prediction, no guarantee. Always labeled as informational, never advice.
export function computeSignals(candles: Candle[]): SignalResult {
  const closes = candles.map((c) => c.close);

  if (closes.length < 26) {
    return {
      rsi: null,
      sma20: null,
      ema20: null,
      macd: null,
      label: "neutral",
      explanation: "Not enough candle history yet to compute indicators for this pair.",
    };
  }

  const rsiValues = RSI.calculate({ period: 14, values: closes });
  const smaValues = SMA.calculate({ period: 20, values: closes });
  const emaValues = EMA.calculate({ period: 20, values: closes });
  const macdValues = MACD.calculate({
    values: closes,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
    SimpleMAOscillator: false,
    SimpleMASignal: false,
  });

  const rsi = rsiValues.at(-1) ?? null;
  const sma20 = smaValues.at(-1) ?? null;
  const ema20 = emaValues.at(-1) ?? null;
  const macdLast = macdValues.at(-1) ?? null;
  const lastClose = closes.at(-1) as number;

  let bullishVotes = 0;
  let bearishVotes = 0;

  if (rsi !== null) {
    if (rsi < 30) bullishVotes++;
    else if (rsi > 70) bearishVotes++;
  }
  if (macdLast?.MACD !== undefined && macdLast?.signal !== undefined) {
    if (macdLast.MACD > macdLast.signal) bullishVotes++;
    else bearishVotes++;
  }
  if (ema20 !== null) {
    if (lastClose > ema20) bullishVotes++;
    else bearishVotes++;
  }

  let label: SignalResult["label"] = "neutral";
  if (bullishVotes > bearishVotes) label = "bullish-lean";
  else if (bearishVotes > bullishVotes) label = "bearish-lean";

  return {
    rsi,
    sma20,
    ema20,
    macd: macdLast ?? null,
    label,
    explanation:
      `Read from RSI(14)=${rsi?.toFixed(1) ?? "n/a"}, price vs EMA(20), and the MACD crossover ` +
      `on recent price history. This is a technical summary of past price action, not a ` +
      `prediction, and not financial advice.`,
  };
}
