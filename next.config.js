/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production';
const basePath = process.env.DEST_DIR;

module.exports = {
  reactStrictMode: true,
  distDir: 'dist',
  trailingSlash: true,
  assetPrefix: isProd
    ? `http://nde-portal.s3-website-us-east-1.amazonaws.com/staging`
    : '',
  // Prefix hyperlinks with the base path.
  basePath: isProd ? `${process.env.DEST_DIR}` : '',
  // [NOTE]:For public environment variables only.
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};
