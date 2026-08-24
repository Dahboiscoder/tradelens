export const PLAN_LIMITS = {
  FREE: { maxConnections: 1, maxWatchlist: 5 },
  PRO: { maxConnections: 5, maxWatchlist: 50 },
  TEAM: { maxConnections: 20, maxWatchlist: 200 },
} as const;

export type PlanId = keyof typeof PLAN_LIMITS;

export function getPlanLimits(plan: string) {
  return PLAN_LIMITS[plan as PlanId] ?? PLAN_LIMITS.FREE;
}

export const PLANS: Array<{
  id: PlanId;
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
}> = [
  {
    id: "FREE",
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Try it with one exchange connection and a small watchlist.",
    features: [
      "1 exchange connection",
      "Up to 5 watchlist pairs",
      "Live price data",
      "RSI / EMA / MACD signals",
    ],
  },
  {
    id: "PRO",
    name: "Pro",
    price: "$19",
    period: "/month",
    description: "For active traders tracking multiple exchanges and pairs.",
    features: [
      "Up to 5 exchange connections",
      "Up to 50 watchlist pairs",
      "Live price data",
      "RSI / EMA / MACD signals",
      "Faster signal refresh",
    ],
  },
  {
    id: "TEAM",
    name: "Team",
    price: "Contact us",
    period: "",
    description: "For desks and small funds that need shared visibility.",
    features: [
      "Up to 20 exchange connections",
      "Up to 200 watchlist pairs",
      "Everything in Pro",
      "Multi-seat access (coming soon)",
    ],
  },
];
