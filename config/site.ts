import type { Dataset } from '@/types/dataset';
import type { NavItem } from '@/types/nav';

export interface RssFeed {
  transformer: string;
  sourceName: string;
  url: string;
}

interface SiteConfig {
  defaultLocale: string;
  datasets: Dataset[];
  rssFeeds: RssFeed[];
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
  rssFeeds: [
    {
      transformer: 'rssTransformer',
      sourceName: 'hyperallergic',
      url: 'https://hyperallergic.com/feed/',
    },
    {
      transformer: 'rssTransformer',
      sourceName: 'moma',
      url: 'https://stories.moma.org/feed',
    },
    {
      transformer: 'rssTransformer',
      sourceName: 'cooperhewitt',
      url: 'https://www.cooperhewitt.org/blog/feed/',
    },
    {
      transformer: 'rssTransformer',
      sourceName: 'va',
      url: 'https://www.vam.ac.uk/blog/feed',
    },
    {
      transformer: 'rssTransformer',
      sourceName: 'sam',
      url: 'https://samblog.seattleartmuseum.org/feed/',
    },
    {
      transformer: 'rssTransformer',
      sourceName: 'mam',
      url: 'https://blog.mam.org/feed/',
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
