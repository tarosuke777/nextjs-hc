import type { NextConfig } from 'next';
import ideConfig from './config/ide.json';
import awsConfig from './config/aws.json';
import prodConfig from './config/prod.json';

const backAppEnv = process.env.BACK_APP_ENV || 'mock';

let selectedConfig: Record<string, string>;

switch (backAppEnv) {
  case 'ide':
    selectedConfig = ideConfig;
    break;
  case 'aws':
    selectedConfig = awsConfig;
    break;
  case 'prod':
    selectedConfig = prodConfig;
    break;
  default:
    selectedConfig = {};
    break;
}

const nextConfig: NextConfig = {
  // basePath: '/hc', // サブドメイン化に伴い、basePathを削除
  env: {
    BACK_APP_ENV: backAppEnv,
    ...selectedConfig,
  },
  output: 'export',
  // assetPrefix: '/hc/', // 静的用ファイルのパスを変更 // サブドメイン化に伴い、assetPrefixを削除
  images: {
    unoptimized: true,
  },

  async headers() {
    return [
      {
        // Service Workerのパス
        source: '/(.*)',
        headers: [
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
    ];
  },
  // サブドメイン化に伴い、リダイレクト設定をコメントアウト
  // async redirects() {
  //   return [
  //     {
  //       source: '/', // リダイレクト元のパス（例）
  //       destination: '/hc', // リダイレクト先のパス
  //       permanent: true, // 恒久的なリダイレクト（308/301）。SEOに有利。一時的な場合は false（307/302）。
  //       basePath: false,
  //     },
  //     // 他のリダイレクトルールもここに追加できます
  //   ];
  // },
};

export default nextConfig;
