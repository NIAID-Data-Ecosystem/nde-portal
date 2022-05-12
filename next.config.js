/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  reactStrictMode: true,
  trailingSlash: true,
  assetPrefix: `${process.env.BASE_URL}`,
  basePath: `${process.env.BASE_URL}`,

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    BASE_URL: process.env.BASE_URL,
  },
};
