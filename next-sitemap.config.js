/** @type {import('next-sitemap').IConfig} */
const fs = require('fs');
const path = require('path');
const SITE_CONFIG = require('./configs/site.config.json');

const PRODUCTION_BASE_URL = 'https://data.niaid.nih.gov';
const BLOCKED_ROBOTS_TXT = ['User-agent: *', 'Disallow: /'].join('\n');
const baseUrl = (process.env.BASE_URL || PRODUCTION_BASE_URL).replace(
  /\/+$/,
  '',
);
const isProduction =
  process.env.NEXT_PUBLIC_APP_ENV === 'production' &&
  baseUrl === PRODUCTION_BASE_URL;
const datasetDir = path.join(__dirname, 'public/sitemaps/datasets');

const getAdditionalSitemaps = () => {
  // Retrieve the list of additional sitemaps from the 'sitemaps' directory
  const files = fs.existsSync(datasetDir) ? fs.readdirSync(datasetDir) : [];

  return files
    .filter(file => file.endsWith('.xml'))
    .sort()
    .map(file => `${baseUrl}/sitemaps/datasets/${file}`);
};

// Exclude paths that are not in production based on the site configuration.
const getExcludePaths = () => {
  const excludePaths = Object.entries(SITE_CONFIG.pages)
    .filter(([_, page]) => page?.env && !page.env.includes('production'))
    .map(([path]) => [path, `${path}/*`]);

  // Flatten the array of arrays into a single array
  return excludePaths.flat();
};

module.exports = {
  siteUrl: baseUrl,
  generateRobotsTxt: true,
  exclude: isProduction ? getExcludePaths() : ['*'],
  robotsTxtOptions: {
    policies: isProduction
      ? [{ userAgent: '*', allow: '/' }]
      : [{ userAgent: '*', disallow: '/' }],
    additionalSitemaps: isProduction ? getAdditionalSitemaps() : [],
    transformRobotsTxt: async (_, robotsTxt) =>
      isProduction ? robotsTxt : `${BLOCKED_ROBOTS_TXT}\n`,
  },
};
