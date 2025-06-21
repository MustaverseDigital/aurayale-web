# Aura Frontend

A Next.js-based Web3 game frontend application that integrates blockchain wallet connection, gem card management, and Unity game engine.

## Features

- **Web3 Integration**: MetaMask and WalletConnect wallet support
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
