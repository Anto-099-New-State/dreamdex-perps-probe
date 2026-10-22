// Read-only snapshot of every dreamDEX perp market on Somnia Tokyo testnet:
// mark/index, feed health, funding and open interest. No key, no transactions.
//
//   npm install && npm run probe
import { defineChain, type Address } from "viem";
import { SomniaMarkets, annualizedFundingRate } from "@somnia-chain/markets-sdk";

const WS = process.env.HIDEKI_WS ?? "wss://api.hideki2.infra.testnet.somnia.network/ws";
const HTTP = process.env.HIDEKI_RPC ?? "https://api.hideki2.infra.testnet.somnia.network";
const INDEXER = process.env.HIDEKI_INDEXER ?? "https://hideki-dev.smk.somnia.host/v1/graphql";

const chain = defineChain({
  id: 50383,
  name: "Somnia Tokyo testnet",
  nativeCurrency: { name: "Somnia", symbol: "SOMI", decimals: 18 },
  rpcUrls: { default: { http: [HTTP], webSocket: [WS] } },
});
const client = new SomniaMarkets({ chain, wsRpcUrl: WS, indexerUrl: INDEXER }).client;
const human = (raw: bigint) => Number(raw) / 1e18;

const markets = await client.listPerpMarkets({ limit: 100 });
console.log(`block ${await client.getHeadBlock()} | ${markets.length} perp markets\n`);
console.log("market    mark          index         feed   funding APR   open interest");
for (const m of markets) {
  const pool = m.poolAddress as Address;
  try {
    const [state, feed] = await Promise.all([client.getPerpState(pool), client.getPerpFeedStatus(pool)]);
    const live = feed.markPriceOk && feed.markPrice > 0n;
    const apr = Number(state.fundingWindowSec) > 0 ? annualizedFundingRate(state.fundingRate, Number(state.fundingWindowSec)) : NaN;
    console.log(
      `${(m.baseSymbol ?? "?").padEnd(9)} ${human(state.markPrice).toFixed(4).padStart(12)}  ${human(state.indexPrice).toFixed(4).padStart(12)}  ` +
        `${(live ? "live" : "STALE").padEnd(6)} ${(apr * 100).toFixed(2).padStart(9)}%   ${Number(state.openInterest) / 10 ** m.baseDecimals}`,
    );
  } catch (e) {
    console.log(`${(m.baseSymbol ?? "?").padEnd(9)} read failed: ${e instanceof Error ? e.message.split("\n")[0] : e}`);
  }
}
process.exit(0);
