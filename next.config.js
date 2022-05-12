/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  reactStrictMode: true,
  // trailingSlash: true,
  assetPrefix: '',
  basePath: '',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    BASE_PREFIX: '/portal',
  },
  exportPathMap: async function (
    defaultPathMap,
    {dev, dir, outDir, distDir, buildId},
  ) {
    return {
      '/': {page: '/'},
      '/portal/about': {page: '/about'},
      '/portal/search': {page: '/search'},
    };
  },
};
