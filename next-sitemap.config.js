/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://allhfa.com', // <- заміни на свій домен
  generateRobotsTxt: true,            // згенерує robots.txt автоматично
  sitemapSize: 5000,                  // кількість URL на sitemap
  exclude: [
    '/api/*',       // заборона індексації всіх API роутів
    '/admin/*',     // заборона адмінки
    '/checkout/*',  // необовʼязково, якщо не хочеш щоб Google бачив checkout
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',           // дозволяємо сканувати весь сайт, крім виключених вище
      },
    ],
  },
};
