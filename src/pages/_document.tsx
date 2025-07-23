import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="UTF-8" />
        <link rel="icon" type="image/png" href="img/001.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Aurayale</title>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 