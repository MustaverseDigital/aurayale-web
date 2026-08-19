import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="UTF-8" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#15161a" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <link href="https://fonts.googleapis.com" rel="preconnect" />
        <link crossOrigin="anonymous" href="https://fonts.gstatic.com" rel="preconnect" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        <title>Mustaverse Digital 邁思達數位</title>
        <meta
          name="description"
          content="Mustaverse Digital (邁思達數位科技) turns brands and characters into trading card games, with the on-chain ownership and XR layers around them."
        />
        <link rel="canonical" href="https://www.mustaversegames.xyz/" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Mustaverse Digital" />
        <meta property="og:title" content="Mustaverse Digital 邁思達數位科技" />
        <meta
          property="og:description"
          content="Mustaverse Digital (邁思達數位科技) turns brands and characters into trading card games, with the on-chain ownership and XR layers around them."
        />
        <meta property="og:url" content="https://www.mustaversegames.xyz/" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:locale:alternate" content="zh_TW" />
        <meta property="og:image" content="https://www.mustaversegames.xyz/images/og-cover.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Mustaverse Digital — IP on cards, on-chain." />

        {/* Twitter / X */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@MustaverseLab" />
        <meta name="twitter:title" content="Mustaverse Digital 邁思達數位科技" />
        <meta
          name="twitter:description"
          content="Mustaverse Digital (邁思達數位科技) turns brands and characters into trading card games, with the on-chain ownership and XR layers around them."
        />
        <meta name="twitter:image" content="https://www.mustaversegames.xyz/images/og-cover.png" />
        <script
          async
          // data-adbreak-test="on"
          data-ad-frequency-hint="30s"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8888583692821895"
          crossOrigin="anonymous"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.adsbygoogle = window.adsbygoogle || [];
              var adBreak = adConfig = function(o) {adsbygoogle.push(o);}
              adConfig({ preloadAdBreaks: 'on' });
            `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 