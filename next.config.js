/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // 在构建时忽略 ESLint 错误（可选，如果需要）
    // ignoreDuringBuilds: false,
  },
  // Unity 已開啟 Decompression Fallback：Build/ 下的資產是 Brotli，但用中性的
  // .unityweb 副檔名，由 loader 內建解壓器處理。
  // 因此這裡「刻意不設」任何 Content-Encoding / Content-Type：
  //   - 設 Content-Encoding 會與實際內容不符（gzip vs brotli）而解碼失敗；
  //   - 設 Content-Type: application/wasm 會讓 Vercel CDN 接手 encoding，
  //     檔案超過約 11MiB 後 header 反而被丟掉（wasm 從 10.5→11.1MiB 時踩過）。
  // vercel.json 同樣只保留 Cache-Control（兩邊要一起維護）。

  webpack: (config, { isServer }) => {
    // 修复 externals 配置
    if (!config.externals) {
      config.externals = [];
    }
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    
    return config;
  },
};

module.exports = nextConfig;
