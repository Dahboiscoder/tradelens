export function P2PSafetyBanner() {
  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4 text-xs leading-relaxed text-amber-200/80">
      <strong className="text-amber-300">TradeLens never holds funds or verifies users in P2P trades.</strong>{" "}
      This is an offer board and messaging tool only — you are dealing directly with another
      person at your own risk. Never send crypto before fiat payment is fully confirmed in your
      own bank account, never trust a payment screenshot, and never send funds outside this chat
      to someone who contacted you off-platform.
    </div>
  );
}
