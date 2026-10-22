# dreamDEX perps probe

A read-only snapshot of every dreamDEX perpetual market on **Somnia Tokyo testnet** (chain 50383), built on the
[Somnia Markets SDK](https://www.npmjs.com/package/@somnia-chain/markets-sdk) (`@somnia-chain/markets-sdk` 0.32.1).

For each market it prints the mark and index price, whether the pool's own mark feed is live, the annualised funding
rate and open interest. It uses no key and sends no transactions.

```bash
npm install
npm run probe
```

Endpoints default to the dreamDEX bot kit's Hideki settings; override with `HIDEKI_WS`, `HIDEKI_RPC`, `HIDEKI_INDEXER`.

Built for the dreamDEX Perps Builder Bounty (feedback track).
