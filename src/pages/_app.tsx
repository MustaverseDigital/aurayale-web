import '../styles/globals.css';
import '../i18n';
import { applyStoredLocale } from '../i18n';
import type { AppProps } from 'next/app';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from '@privy-io/wagmi';
import { PrivyProvider } from '@privy-io/react-auth';
import { UserProvider, useUser } from "../context/UserContext";
import React from 'react';

import { config, soneiumMinato, avaxFuji, bscTestnet } from '../wagmi';
import { ViewportRequirementsProvider } from "../context/ViewportRequirementsContext";

const client = new QueryClient();

function ContextStateViewer() {
  const { user } = useUser();
  return (
    <DevOnly>
      <CollapsibleViewer title="" position="bottom-right">
        <code>{JSON.stringify(user, null, 2)}</code>
      </CollapsibleViewer>
    </DevOnly>
  );
}

function DevOnly({ children }: { children: React.ReactNode }) {
  if (process.env.NODE_ENV !== 'development') return null;
  return <>{children}</>;
}

function CollapsibleViewer({ title, position, children }: { title: string; position?: 'bottom-right' | 'bottom-left'; children: React.ReactNode; }) {
  const [open, setOpen] = React.useState(false);
  const posStyle = position === 'bottom-left' ? { left: 1, bottom: 1 } : { right: 1, bottom: 1 } as React.CSSProperties;
  return (
    <div style={{ position: 'fixed', zIndex: 9999, ...posStyle }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          background: 'rgba(0,0,0,0.6)',
          color: '#e2e8f0',
          padding: '6px 10px',
          borderRadius: 10,
          fontSize: 12,
          border: '1px solid rgba(255,255,255,0.15)'
        }}
      >
        {open ? `Hide ${title}` : `Show ${title}`}
      </button>
      {open && (
        <div style={{
          marginTop: 8,
          background: 'rgba(0,0,0,0.6)',
          color: '#cbd5e1',
          padding: '8px 10px',
          borderRadius: 12,
          maxWidth: 420,
          maxHeight: 320,
          overflow: 'auto',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          fontSize: 12,
          lineHeight: 1.4,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          border: '1px solid rgba(255,255,255,0.15)'
        }}>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{title}</div>
          {children}
        </div>
      )}
    </div>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  // hydration 完成後才套用使用者語系，避免 server/client 文字不一致。
  React.useEffect(() => {
    applyStoredLocale();
  }, []);

  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      config={{
        loginMethods: ['email', 'wallet', 'google', 'farcaster'],
        appearance: {
          theme: 'dark',
          accentColor: '#000000',
          logo: 'https://brown-implicit-bass-794.mypinata.cloud/ipfs/bafkreibvsexzxfkiglnmt3omi5tbioz5suzxin22mtpf3arih56c6svt3a',
          landingHeader: 'Welcome to Aurayale!',
          loginMessage: 'Create your account or login to continue',
          walletList: ['metamask','zerion', 'rainbow', 'wallet_connect'],
          showWalletLoginFirst: false,
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: 'users-without-wallets'
          }
        },
        // 比賽 / 正式流程統一使用 BSC Testnet（見 EXHIBITION_BETA_PLAN.md N2）。
        defaultChain: bscTestnet,
        supportedChains: [bscTestnet, soneiumMinato, avaxFuji]
      }}
    >
      <QueryClientProvider client={client}>
        <WagmiProvider config={config}>
          <UserProvider>
            <ViewportRequirementsProvider>
              <Component {...pageProps} />
              <ContextStateViewer />
              {/* <PortraitRequirementOverlay /> */}
            </ViewportRequirementsProvider>
          </UserProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
