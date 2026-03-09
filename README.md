# Aura Frontend

Aurayale is a Next.js-based Web3 game frontend that connects a Unity WebGL game client, a web marketplace layer, and an on-chain asset system.

## System Architecture

Aurayale is structured around three main components: the game client, the web marketplace layer, and the on-chain asset system.

### 1. Game Client (Unity WebGL)

The gameplay layer is implemented in Unity and deployed as a WebGL mobile browser experience. Players explore the Gem Universe, collect cards, build decks, and participate in battles. Gameplay events such as rewards, card acquisition, and progression are synchronized with backend services before assets are finalized on-chain.

### 2. Web Platform & Marketplace Layer

The web platform manages user sessions, player state, and marketplace interactions. Players can browse cards, manage their decks, and access the SwUp trading interface. When a player creates a swap request, the request is submitted to the SwUp smart contract and indexed by backend services to produce a real-time marketplace order view.

### 3. On-Chain Asset & Exchange System

Gem cards are modeled as ERC-1155 NFTs. The SwUp smart contract handles decentralized swap requests and upgrade logic. When a trade is executed, the original NFT can be burned and replaced with a new upgraded asset. Upgrade outcomes are determined using Chainlink VRF to ensure verifiable randomness.

### End-to-End Flow

1. The player enters the Unity WebGL client and completes battles or exploration.
2. The player receives Gem cards and edits their deck through the web interface.
3. If the player needs a specific card, they create a swap request through the SwUp marketplace.
4. Another player fulfills the request through the SwUp smart contract.
5. The transaction is recorded on-chain, assets are transferred, and upgrade logic may trigger via VRF.

This architecture separates gameplay, marketplace services, and on-chain asset ownership, allowing Aurayale to maintain smooth mobile gameplay while supporting decentralized asset exchange and verifiable upgrades.

## Networks & Contracts

- **Primary testnet (Farcaster / Privy login)**: `soneium-testnet`
- **Google (Privy) login chain**: `avax-fuji-testnet` (Avalanche Fuji testnet)
- **SwUp ERC-1155 gem contract (Fuji)**: `0x6555105Fd4BDE83514Fe90921B836f9a3B92da7c`  
  - Explorer: `https://testnet.snowscan.xyz/address/0x6555105Fd4BDE83514Fe90921B836f9a3B92da7c`

## Features

- **Web3 Integration**: MetaMask, embedded wallets, and Privy authentication (email, Google, Farcaster)
- **Card Management**: Gem card collection and deck building
- **Unity Game Integration**: Unity games running in browser via WebGL
- **Modern UI**: Responsive interface built with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 15.3.3
- **React**: 19.1.0
- **Styling**: Tailwind CSS 4.1.9
- **Web3**: Wagmi 2.15.5, Viem 2.29.2, RainbowKit 2.1.4
- **Game Integration**: React Unity WebGL 9.9.0
- **Language**: TypeScript 5.5.4

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- MetaMask browser extension

### Installation

1. **Clone the project**

   ```bash
   git clone <repository-url>
   cd aura-frontend
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Start development server**

   ```bash
   pnpm dev
   # or
   npm run dev
   ```

4. **Open browser**
   Visit [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
# Build the project
pnpm build

# Start production server
pnpm start
```

## Project Structure

```
src/
├── pages/                 # Next.js pages
│   ├── index.tsx         # Main page - Card manager
│   ├── _app.tsx          # App entry point
│   └── auraServerTester/ # API testing tool
├── api/
│   └── auraServer.ts     # Aura backend API integration
├── styles/
│   └── globals.css       # Global styles
└── wagmi.ts              # Wagmi configuration

public/
├── Build/                # Unity WebGL build files
├── bgm/                  # Background music
└── img/                  # Image assets
```

## Usage

1. **Connect Wallet**: Click "Connect Wallet" and authorize with MetaMask
2. **Manage Cards**: Select/deselect cards to build your 10-card deck
3. **Play Game**: Your deck will sync to the Unity game automatically

## API Testing

Visit `/auraServerTester` to test the API endpoints for wallet connection, login, and card management.

---

**Note**: This project requires connection to the Aura backend service to function properly.
