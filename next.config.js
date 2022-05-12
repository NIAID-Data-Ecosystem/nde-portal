/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  reactStrictMode: true,
  // trailingSlash: true,
  assetPrefix: isProd ? process.env.BASE_URL : '',
  basePath: isProd ? process.env.BASE_URL : '',

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    BASE_URL: isProd ? process.env.BASE_URL : '',
  },
};
