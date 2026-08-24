import "server-only";
import ccxt, { Exchange } from "ccxt";
import { SUPPORTED_EXCHANGES, isSupportedExchange } from "./exchangeList";

export { SUPPORTED_EXCHANGES, isSupportedExchange };
export type { SupportedExchangeId } from "./exchangeList";

function buildClient(exchangeId: string, credentials?: { apiKey: string; secret: string }) {
  if (!isSupportedExchange(exchangeId)) {
    throw new Error(`Unsupported exchange: ${exchangeId}`);
  }
  const ExchangeClass = (ccxt as unknown as Record<string, new (opts: unknown) => Exchange>)[
    exchangeId
  ];
  return new ExchangeClass({
    enableRateLimit: true,
    ...(credentials ? { apiKey: credentials.apiKey, secret: credentials.secret } : {}),
  });
}

export async function fetchPublicTicker(exchangeId: string, symbol: string) {
  const client = buildClient(exchangeId);
  return client.fetchTicker(symbol);
}

export async function fetchPublicOHLCV(
  exchangeId: string,
  symbol: string,
  timeframe = "1h",
  limit = 100
) {
  const client = buildClient(exchangeId);
  return client.fetchOHLCV(symbol, timeframe, undefined, limit);
}

export interface HoldingBalance {
  asset: string;
  amount: number;
}

// Read-only by design: we only ever call fetchBalance, never a withdrawal or transfer
// endpoint. Users are told in the UI to create keys with trading/read permissions only —
// this app has no code path that could use withdrawal access even if a key granted it.
export async function fetchAccountBalance(
  exchangeId: string,
  apiKey: string,
  secret: string
): Promise<HoldingBalance[]> {
  const client = buildClient(exchangeId, { apiKey, secret });
  const balance = await client.fetchBalance();
  const total = (balance.total ?? {}) as unknown as Record<string, number>;
  return Object.entries(total)
    .filter(([, amount]) => typeof amount === "number" && amount > 0)
    .map(([asset, amount]) => ({ asset, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export async function verifyConnection(exchangeId: string, apiKey: string, secret: string) {
  await fetchAccountBalance(exchangeId, apiKey, secret);
}

export interface PlaceOrderParams {
  exchangeId: string;
  apiKey: string;
  apiSecret: string;
  symbol: string;
  side: "BUY" | "SELL";
  type: "MARKET" | "LIMIT";
  amount: number;
  price?: number;
}

export interface PlaceOrderResult {
  id: string | null;
  status: string | null;
}

// Places exactly one order, exactly once, only when explicitly called with confirm:true
// from the client (see the orders API route). There is no polling loop, no strategy, and
// no autonomous re-submission anywhere in this app — every order is a single human action.
export async function placeOrder(params: PlaceOrderParams): Promise<PlaceOrderResult> {
  const client = buildClient(params.exchangeId, { apiKey: params.apiKey, secret: params.apiSecret });
  const order = await client.createOrder(
    params.symbol,
    params.type.toLowerCase(),
    params.side.toLowerCase(),
    params.amount,
    params.type === "LIMIT" ? params.price : undefined
  );
  return { id: order.id ?? null, status: order.status ?? null };
}
