import type { NavItem } from '@/types/nav';

/**
 * Represents a dataset with necessary information for ingestion.
 */
export interface Dataset {
  /** Human-readable name */
  name: string;
  /** List of indices to ingest */
  indices: string[];
  /** Directory where data & transformer are stored */
  directory: string;
}

/**
 * Represents an RSS feed with necessary information for ingestion.
 */
export interface RssFeed {
  /** Transformer to use, typically rssTransformer */
  transformer: string;
  /** Human-readable name */
  sourceName: string;
  /** ID of source */
  sourceId: string;
  /** URL of RSS feed */
  url: string;
}

/**
 * Represents the site configuration.
 */
interface SiteConfig {
  /** Default locale for the site.  Currently only en supported. */
  defaultLocale: string;
  /** List of datasets to ingest */
  datasets: Dataset[];
  /** List of RSS feeds to ingest */
  rssFeeds: RssFeed[];
  /** List of nav items */
  mainNav: NavItem[];
  /** List of secondary/social links */
  links?: {
    github?: string;
    twitter?: string;
    instagram?: string;
  };
}

/**
 * The site configuration.  Defines all datasets, RSS feeds, and nav items.
 */
export const siteConfig: SiteConfig = {
  defaultLocale: 'en',
  /**
   * For each dataset + index, there should be a dataset & transformer:
   * - data/{dataset.directory}/{indexName}.jsonl.gz
   * - util/import/transform/{dataset.directory}/{indexName}Transformer.ts
   */ 
  datasets: [
    {
      name: 'Brooklyn Museum',
      indices: ['collections'],
      directory: 'bkm',
    },
    {
      name: 'Museum of Modern Art',
      indices: ['collections'],
      directory: 'moma',
    },
  ],
  rssFeeds: [
    {
      transformer: 'rssTransformer',
      sourceName: 'Hyperallergic',
      sourceId: 'hyperallergic',
      url: 'https://hyperallergic.com/feed/',
    },
    {
      transformer: 'rssTransformer',
      sourceName: 'MoMA',
      sourceId: 'moma',
      url: 'https://stories.moma.org/feed',
    },
    {
      transformer: 'rssTransformer',
      sourceName: 'Cooper Hewitt',
      sourceId: 'cooperhewitt',
      url: 'https://www.cooperhewitt.org/blog/feed/',
    },
    {
      transformer: 'rssTransformer',
      sourceName: 'V&A',
      sourceId: 'vam',
      url: 'https://www.vam.ac.uk/blog/feed',
    },
    {
      transformer: 'rssTransformer',
      sourceName: 'Seattle Art Museum',
      sourceId: 'sam',
      url: 'https://samblog.seattleartmuseum.org/feed/',
    },
    {
      transformer: 'rssTransformer',
      sourceName: 'Milwaukee Art Museum',
      sourceId: 'mam',
      url: 'https://blog.mam.org/feed/',
    },
    {
      transformer: 'rssTransformer',
      sourceName: 'ARTnews',
      sourceId: 'artnews',
      url: 'https://www.artnews.com/feed/',
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
