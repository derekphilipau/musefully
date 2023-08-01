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
      indices: ['collections', 'content', 'archives'],
    },
    {
      name: 'Museum of Modern Art',
      sourceName: 'moma',
      indices: ['collections'],
    },
  ],
  mainNav: [
    {
      dict: 'nav.search',
      href: '/search/collections?hasPhoto=true&f=true',
    },
  ],
  links: {
    github: 'https://github.com/derekphilipau/museum-nextjs-search',
  },
};
