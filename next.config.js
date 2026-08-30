/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // 在构建时忽略 ESLint 错误（可选，如果需要）
    // ignoreDuringBuilds: false,
  },
  // Build/ 下的資產內容是 Brotli，但副檔名是中性的 .unityweb（Unity 開啟
  // Decompression Fallback 後的產物）。仍需送 Content-Encoding: br —— 讓瀏覽器
  // 原生解壓最快，fallback 只是萬一 header 沒到時的保險。
  //
  // 刻意不設 Content-Type: application/wasm —— wasm 在 Vercel CDN 的自動壓縮
  // MIME 清單內，宣告該型別會讓 CDN 接手 encoding，檔案超過約 11MiB 後我們的
  // Content-Encoding 反而會被丟掉（wasm 從 10.5MiB 長到 11.1MiB 時就踩到了）。
  // .unityweb 不在該清單內，Vercel 會原樣送出。
  // 正式環境由 vercel.json 提供同等設定（兩邊要一起維護）。
  async headers() {
    return [
      {
        source: "/:dir(Build)/:file*.unityweb",
        headers: [{ key: "Content-Encoding", value: "br" }],
      },
    ];
  },

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
