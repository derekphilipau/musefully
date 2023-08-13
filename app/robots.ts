import { MetadataRoute } from 'next'
 
const hostname = 'https://musefully.org';
const sitemap = `${hostname}/sitemap.xml`;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // disallow: '/private/',
    },
    sitemap,
  }
}