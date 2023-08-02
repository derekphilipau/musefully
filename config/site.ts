import type { Dataset } from '@/types/dataset';
import type { NavItem } from '@/types/nav';

interface SiteConfig {
  defaultLocale: string;
  datasets: Dataset[];
  mainNav: NavItem[];
  links?: {
    github?: string;
    twitter?: string;
    instagram?: string;
  };
}

export const siteConfig: SiteConfig = {
  defaultLocale: 'en',
  datasets: [
    {
      name: 'Brooklyn Museum',
      sourceName: 'bkm',
      indices: ['collections', 'content'],
    },
    {
      name: 'Museum of Modern Art',
      sourceName: 'moma',
      indices: ['collections'],
    },
  ],
  mainNav: [
    {
      dict: 'index.collections',
      href: '/collections?hasPhoto=true&f=true',
    },
    {
      dict: 'index.content',
      href: '/content',
    },
  ],
  links: {
    github: 'https://github.com/derekphilipau/museum-nextjs-search',
  },
};
