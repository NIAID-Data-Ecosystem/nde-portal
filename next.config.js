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
  webpack: (config, { isServer, webpack }) => {
    // Fixes npm packages (mdx) that depend on `fs` module

    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        child_process: false,
      };
    }

    config.plugins.push(
      // Remove node: from import specifiers, because Next.js does not yet support node: scheme
      // https://github.com/vercel/next.js/issues/28774
      new webpack.NormalModuleReplacementPlugin(/^node:/, resource => {
        resource.request = resource.request.replace(/^node:/, '');
      }),
    );

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
    NEXT_PUBLIC_BASE_URL: process.env.BASE_URL,
  },
});
