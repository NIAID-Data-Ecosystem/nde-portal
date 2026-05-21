/** @type {import('next-sitemap').IConfig} */
const fs = require('fs');
const path = require('path');
const SITE_CONFIG = require('./configs/site.config.json');

if (!process.env.BASE_URL) {
  throw new Error('BASE_URL is required for sitemap generation');
}

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

const isProduction = process.env.NEXT_PUBLIC_APP_ENV === 'production';

module.exports = {
  siteUrl: process.env.BASE_URL || 'https://data.niaid.nih.gov',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  exclude: isProduction ? getExcludePaths() : ['/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    additionalSitemaps: isProduction ? getAdditionalSitemaps() : [],
  },
};
