// Client-safe: no ccxt import here. The full ccxt library is large (100+ exchange
// integrations) and must never end up in the browser bundle — server-only code that
// actually talks to ccxt lives in exchanges.ts instead.

export const SUPPORTED_EXCHANGES = [
  { id: "binance", name: "Binance" },
  { id: "coinbase", name: "Coinbase" },
  { id: "kraken", name: "Kraken" },
  { id: "okx", name: "OKX" },
  { id: "bybit", name: "Bybit" },
  { id: "kucoin", name: "KuCoin" },
] as const;

export type SupportedExchangeId = (typeof SUPPORTED_EXCHANGES)[number]["id"];

export function isSupportedExchange(id: string): id is SupportedExchangeId {
  return SUPPORTED_EXCHANGES.some((e) => e.id === id);
}
