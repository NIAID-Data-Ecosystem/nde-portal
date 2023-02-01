/** @type {import('next').NextConfig} */

const isProd = process.env.NODE_ENV === 'production';
const withMDX = require('@next/mdx')({
  extension: /\.mdx$/,
  options: {
    // If you use remark-gfm, you'll need to use next.config.mjs
    // as the package is ESM only
    // https://github.com/remarkjs/remark-gfm#install
    remarkPlugins: [],
    rehypePlugins: [],
    // If you use `MDXProvider`, uncomment the following line.
    providerImportSource: '@mdx-js/react',
  },
});

module.exports = withMDX({
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  reactStrictMode: true,
  trailingSlash: true,
  assetPrefix: isProd ? process.env.BASE_URL : undefined,
  basePath: isProd ? process.env.BASE_URL : '',
  webpack: (config, { isServer }) => {
    // Fixes npm packages (mdx) that depend on `fs` module
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }
    return {
      ...config,

      module: Object.assign({}, config.module, {
        rules: config.module.rules.concat([
          {
            test: /\.md$/,
            loader: 'raw-loader',
          },
        ]),
      }),
    };
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_GOOGLE_ANALYTICS: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS,
    BASE_URL: isProd ? process.env.BASE_URL : '',
    README_API_KEY: process.env.README_API_KEY,
  },
});
