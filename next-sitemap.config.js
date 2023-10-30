/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.BASE_URL,
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', disallow: '/' },
      {
        userAgent: 'googlebot',
        allow: '/',
      },
      { userAgent: 'bingbot', allow: '/' },
    ],
  },
};
