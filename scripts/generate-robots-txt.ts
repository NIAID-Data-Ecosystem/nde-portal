import fs from 'fs';
import path from 'path';

const PRODUCTION_BASE_URL = 'https://data.niaid.nih.gov';
const BLOCKED_ROBOTS_TXT = ['User-agent: *', 'Disallow: /'].join('\n');

const normalizeBaseUrl = (url = PRODUCTION_BASE_URL) => url.replace(/\/+$/, '');

const baseUrl = normalizeBaseUrl(process.env.BASE_URL);
const isProduction =
  process.env.NEXT_PUBLIC_APP_ENV === 'production' &&
  baseUrl === PRODUCTION_BASE_URL;

const robotsPath = path.join(process.cwd(), 'out', 'robots.txt');
const datasetSitemapsDir = path.join(
  process.cwd(),
  'public',
  'sitemaps',
  'datasets',
);

const getDatasetSitemaps = () => {
  const files = fs.existsSync(datasetSitemapsDir)
    ? fs.readdirSync(datasetSitemapsDir)
    : [];

  return files
    .filter(file => file.endsWith('.xml'))
    .sort()
    .map(file => `Sitemap: ${baseUrl}/sitemaps/datasets/${file}`);
};

const productionRobotsTxt = [
  '# *',
  'User-agent: *',
  'Allow: /',
  '',
  '# Host',
  `Host: ${baseUrl}`,
  '',
  '# Sitemaps',
  `Sitemap: ${baseUrl}/sitemap.xml`,
  ...getDatasetSitemaps(),
].join('\n');

fs.mkdirSync(path.dirname(robotsPath), { recursive: true });
fs.writeFileSync(
  robotsPath,
  `${isProduction ? productionRobotsTxt : BLOCKED_ROBOTS_TXT}\n`,
);

console.log(
  `Generated ${
    isProduction ? 'production' : 'blocked'
  } robots.txt for ${baseUrl}`,
);
