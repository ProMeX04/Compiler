const sitemapConfig = {
  siteUrl: "https://compiler-pro.vercel.app",
  generateRobotsTxt: true,
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: ['/admin/*', '/private/*'],
  robotsTxtOptions: {
    additionalSitemaps: [],
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/private', '/admin']
      }
    ]
  }
};

export default sitemapConfig;
