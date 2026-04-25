# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Aurayale is a Next.js 15 (Pages Router) + React 19 frontend that glues together a Unity WebGL game client, a card/swap marketplace, and on-chain ERC-1155 gem assets across multiple EVM testnets. Authentication is handled by Privy (email / wallet / Google / Farcaster) and gameplay state is mirrored to a backend (`https://aura-server.zeabur.app/api`) which issues a JWT used for all authenticated requests and is forwarded into Unity.

## Commands

Package manager is **pnpm 9.15.4** (`packageManager` field), Node **>=20**.

```bash
pnpm install              # install
pnpm dev                  # next dev (http://localhost:3000)
pnpm build                # next build
pnpm start                # production server

# Used by CI but no npm script wraps them:
pnpm next lint            # ESLint (next/core-web-vitals)
pnpm tsc --noEmit         # type check
```

There is no test runner configured. Builds in CI are `continue-on-error` because Vercel performs the real build/deploy — only lint and typecheck gate PRs.

`NEXT_PUBLIC_PRIVY_APP_ID` is required at build time (Privy SDK runs during prerender). `NEXT_PUBLIC_API_URL` is referenced in `.env.example` but the production base URL is currently hardcoded in `src/api/auraServer.ts`.

Path alias: `@/*` → `./src/*`.

## Architecture

### Provider stack (`src/pages/_app.tsx`)

`PrivyProvider` → `QueryClientProvider` → `WagmiProvider` (the `@privy-io/wagmi` variant, **not** plain wagmi) → `UserProvider` → `ViewportRequirementsProvider`. Two chains are registered: `soneiumMinato` (1946) and `avaxFuji` (43113); `defaultChain` is Soneium. When adding wallet/contract code, use `@privy-io/wagmi` and `@privy-io/react-auth` together — the `useWallets()` hook is the source of truth for connected wallets.

### Authentication and chain selection

Login type determines the chain, not the other way around:

- **Farcaster** login → `soneium-testnet` (Soneium Minato, id 1946)
- **Google** login → `avax-fuji` (Avalanche Fuji, id 43113)
- **Email / wallet-only** Privy auth has no AuraServer session; `UserContext.token` is set to the sentinel `"privy-auth-token"`.

`useLogin` (`src/hooks/useLogin.ts`) is the single place that runs the Privy → AuraServer exchange (`POST /privy-login`) and hydrates `UserContext` with `{ token, userId, chainId, walletAddress, deck, gems, loginType, ... }`. `useChainSwitch` re-runs the same exchange against a different `chain_id` to swap chains; password-login users cannot switch chains because we do not retain credentials.

Chain string ↔ EVM chain conversion lives in `src/lib/chainUtils.ts` (`getChainFromApiChainId`, `getEvmChainId`, `getDefaultChainForLoginType`). Treat `user.chainId` (an API string like `"soneium-testnet"`) as authoritative; derive numeric/EVM chain from it via these helpers.

The `"privy-auth-token"` sentinel is meaningful — code that needs a real backend session (e.g. forwarding to Unity, calling `/user/*` endpoints) must guard against it. See `src/pages/battle.tsx`'s `SetAuthToken` effect for the pattern.

### Two contract-call patterns coexist

Both target the same `GemContract` ABI / `getContractAddress(chainId)` lookup but with different transports:

1. **wagmi + Privy `useSendTransaction`** (`src/hooks/useTradeOrder.ts`) — used for SwUp trade orders. The `useActiveWallet` helper resolves the active wallet from `useWallets()` (preferring the one matching `privyUser.wallet.address`, falling back to any embedded wallet), parses the wallet's CAIP-style `chainId` string, and switches chain via `activeWallet.switchChain` before sending. Transactions are sent with `encodeFunctionData` + `sendTransaction({ to, data }, { address })`.
2. **viem directly via Privy provider** (`src/hooks/usePrivyContract.ts`) — `usePrivyReadContract` / `usePrivyWriteContract` build viem `publicClient` / `walletClient` from the embedded wallet's Ethereum provider. Chain comes from `UserContext`, not from the wallet.

When in doubt for new contract code, mirror `useTradeOrder.ts` — it has the most thorough wallet/chain resolution and error handling.

### Unity WebGL bridge

The Unity build is served from `public/Build/` and loaded on `/battle` (`src/pages/battle.tsx`) via `react-unity-webgl`. `vercel.json` injects `Content-Encoding: gzip|br` and `Content-Type: application/wasm` headers for files under `/Build/`.

Web → Unity uses `unityContext.sendMessage(gameObject, method, payload)`:
- `Web.SetCardDeck(deckJson)` — read from `localStorage["battleDeck"]` set by `/platform`.
- `WebBridge.SetAuthToken(jwt)` — sent once `isLoaded && user.token && token !== "privy-auth-token"`. The `sentTokenRef` guard prevents duplicate sends and is cleared on logout.
- `WebBridge.OnRewardAdSuccess` / `OnRewardAdFailed` — used by `useRewardAd` to deliver reward results back into the game.

Canvas sizing is forced to a 9:16 portrait aspect ratio via `useCanvasWidth` and the orientation gate in `ViewportRequirementsContext` (requires portrait + ≥400 px height). Don't fight this — the Unity build assumes portrait.

### Reward ad flow

`_document.tsx` injects Google AdSense (`adsbygoogle.js`) and creates the global `window.adBreak` shim. `src/hooks/useRewardAd.ts` wraps that in a typed callback flow: ad shown → (intended: `simulateAdCallback` → `claimReward`) → emit `viewed` event to Unity. **The backend `simulate-callback` and `claim` calls are currently commented out in `showRewardAd`** and a mock `{ stamina: +1 }` reward is emitted instead — re-enable those calls before relying on real reward state. The standalone `claim()` function still hits `/reward/claim` for live use.

### Card ID convention

`src/lib/utils.ts` `getCardImagePath` / `getCardUpgradeLevel` encode upgrade level in the hundreds digit of the card id: `id < 100` is a base card (`007_00.png`), `104` is base 4 upgraded once (`004_01.png`), `204` upgraded twice (`004_02.png`). Any new code that maps card ids to assets or upgrade tiers should go through these helpers.

### Contract addresses

`src/contracts/addresses.ts` maps EVM chain id → SwUp gem contract address. The Fuji entry is currently the same as Soneium (`0x6555105Fd4BDE83514Fe90921B836f9a3B92da7c`) with a `TODO` to update post-deploy — verify against the live deployment before assuming Fuji is correctly wired.

## Conventions worth knowing

- Comments and Chinese identifiers are mixed throughout (繁體 + 簡體). Match the style of the file you're editing.
- The dev-only floating context viewer in `_app.tsx` (`ContextStateViewer` / `CollapsibleViewer`) is gated on `NODE_ENV === 'development'`; treat it as a debug aid, not a feature.
- Tailwind CSS v4 is used with the `@theme` block in `src/styles/globals.css` defining design tokens (`--color-primary`, etc.); there is no `tailwind.config.js`.
- ESLint config is `next/core-web-vitals` only — no custom rules.
