import { MetadataRoute } from 'next';

const hostname = 'https://musefully.org';
const now = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${hostname}`,
      lastModified: now,
    },
    {
      url: `${hostname}/about`,
      lastModified: now,
    },
    {
      url: `${hostname}/art`,
      lastModified: now,
    },
    {
      url: `${hostname}/news`,
      lastModified: now,
    },
    {
      url: `${hostname}/events`,
      lastModified: now,
    },
  ];
}
