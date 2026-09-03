import '../styles/globals.css';
import '../i18n';
import { applyStoredLocale } from '../i18n';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Geist, Geist_Mono } from 'next/font/google';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from '@privy-io/wagmi';
import { PrivyProvider } from '@privy-io/react-auth';
import { UserProvider, useUser } from "../context/UserContext";
import React from 'react';

import { config, soneiumMinato, avaxFuji, bscTestnet } from '../wagmi';
import { ViewportRequirementsProvider } from "../context/ViewportRequirementsContext";

const client = new QueryClient();

/**
 * 行銷頁字體。Geist 當展示與內文，Geist Mono 給微標籤與數字。
 *
 * 用 next/font 自帶（自架 + preload），不再從 _document 用 <link> 拉
 * Google Fonts：少兩次跨網域往返，也不會有 FOUT。
 *
 * 變數必須掛在 :root（見下方注入的 <style>），不能只掛在某個容器 class 上：
 * CSS 自訂屬性的 var() 是在「宣告處」代換的，globals.css 的
 * --font-display: var(--font-geist) 宣告在 :root，若 --font-geist 只存在於
 * 下層元素，:root 上就會直接落回 fallback，整站字體換不過去。
 */
const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist',
});
const geistMono = Geist_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-geist-mono',
});

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
        loginMethods: ['email', 'wallet', 'google'],
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
              <Head>
                <style
                  dangerouslySetInnerHTML={{
                    __html: `:root{--font-geist:${geist.style.fontFamily};--font-geist-mono:${geistMono.style.fontFamily}}`,
                  }}
                />
              </Head>
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
