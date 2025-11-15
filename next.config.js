/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // 在构建时忽略 ESLint 错误（可选，如果需要）
    // ignoreDuringBuilds: false,
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
