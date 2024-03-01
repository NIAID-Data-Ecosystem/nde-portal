/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.BASE_URL,
  generateRobotsTxt: true,
  exclude: ['/sitemap-datasets.xml'],
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', disallow: '/' },
      {
        userAgent: 'googlebot',
        allow: '/',
      },
      { userAgent: 'bingbot', allow: '/' },
    ],
    additionalSitemaps: [`${process.env.BASE_URL}/sitemap-datasets.xml`],
  },
};