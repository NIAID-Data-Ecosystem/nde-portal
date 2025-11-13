/** @type {import('next-sitemap').IConfig} */
const fs = require('fs');
const path = require('path');
const SITE_CONFIG = require('./configs/site.config.json');

const datasetDir = path.join(__dirname, 'public/sitemaps/datasets');

const getAdditionalSitemaps = () => {
  // Retrieve the list of additional sitemaps from the 'sitemaps' directory
  const files = fs.existsSync(datasetDir) ? fs.readdirSync(datasetDir) : [];

  return files
    .filter(file => file.endsWith('.xml'))
    .map(file => `${process.env.BASE_URL}/sitemaps/datasets/${file}`);
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
  siteUrl: process.env.BASE_URL || 'https://data.niaid.nih.gov',
  generateRobotsTxt: true,
  exclude: getExcludePaths(),
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', disallow: '/' },
      {
        userAgent: 'googlebot',
        allow: '/',
      },
      { userAgent: 'bingbot', allow: '/' },
      { userAgent: 'DuckDuckBot', allow: '/' },
    ],
    additionalSitemaps: getAdditionalSitemaps(),
  },
};
