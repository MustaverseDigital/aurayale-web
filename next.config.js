/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // 在构建时忽略 ESLint 错误（可选，如果需要）
    // ignoreDuringBuilds: false,
  },
  // 本機 dev/start 不會套用 vercel.json，需在此補上 Unity WebGL 的壓縮標頭，
  // 否則瀏覽器拿到 .br 檔卻不知道要解壓，載入會失敗。
  // 正式環境由 vercel.json 提供同等設定（兩邊要一起維護）。
  async headers() {
    return [
      {
        source: "/:dir(Build|demo)/:file*.br",
        headers: [{ key: "Content-Encoding", value: "br" }],
      },
      {
        source: "/:dir(Build|demo)/:file*.unityweb",
        headers: [{ key: "Content-Encoding", value: "gzip" }],
      },
      {
        source: "/:dir(Build|demo)/:file*.gz",
        headers: [{ key: "Content-Encoding", value: "gzip" }],
      },
      {
        source: "/:dir(Build|demo)/:file*.wasm.br",
        headers: [{ key: "Content-Type", value: "application/wasm" }],
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
