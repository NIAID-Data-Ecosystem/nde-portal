/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  reactStrictMode: true,
  distDir: 'dist',
  trailingSlash: true,
  assetPrefix: isProd ? `${process.env.ASSET_PREFIX}` : '',
  // Prefix hyperlinks with the base path.
  basePath: isProd ? `/${process.env.BASE_PREFIX}` : '',
  // [NOTE]:For public environment variables only.
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    ASSET_PREFIX: process.env.ASSET_PREFIX,
    BASE_PREFIX: process.env.BASE_PREFIX,
  },
};
