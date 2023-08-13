import type { NavItem } from '@/types/nav';

/**
 * Represents an RSS feed with necessary information for ingestion.
 */
export interface RssFeedConfig {
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
  /** Whether the site is multi-source. */
  isMultiSource: boolean;
  /** List of ingesters */
  ingesters: string[];
  /** List of crawlers in /util/import/transform/events/ directory */
  eventCrawlers: string[];
  /** List of extractors in /util/import/extract/ directory */
  extractors: string[];
  /** List of RSS feeds to ingest */
  rssFeeds: RssFeedConfig[];
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
 * The site configuration.  Defines all ingesters, RSS feeds, and nav items.
 */
export const siteConfig: SiteConfig = {
  defaultLocale: 'en',
  isMultiSource: true,
  /**
   * Dynamically load from ./util/import/ingesters/{ingester}.ts
   */ 
  ingesters: [
    'bkm/collectionsIngester',
    'moma/collectionsIngester',
    'whitney/collectionsIngester',
    'met/collectionsIngester',
  ],
  eventCrawlers: [
    'bkmExhibitionsCrawler',
  ],
  extractors: [
    'openAiExhibitionsExtractor',
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
    {
      transformer: 'rssTransformer',
      sourceName: 'NYT Art & Design',
      sourceId: 'nyt',
      url: 'https://rss.nytimes.com/services/xml/rss/nyt/ArtandDesign.xml',
    },
    {
      transformer: 'rssTransformer',
      sourceName: 'The Met',
      sourceId: 'met',
      url: 'https://www.metmuseum.org/blogs?rss=1',
    },
    {
      transformer: 'rssTransformer',
      sourceName: 'Artsy',
      sourceId: 'artsy',
      url: 'https://www.artsy.net/rss/news',
    },
    {
      transformer: 'rssTransformer',
      sourceName: 'Colossal',
      sourceId: 'colossal',
      url: 'https://www.thisiscolossal.com/feed/',
    },
    {
      transformer: 'rssTransformer',
      sourceName: 'Hi-Fructose',
      sourceId: 'hifructose',
      url: 'https://hifructose.com/feed/',
    },
    {
      transformer: 'rssTransformer',
      sourceName: 'Juxtapoz',
      sourceId: 'juxtapoz',
      url: 'https://www.juxtapoz.com/news/?format=feed&type=rss',
    },
    {
      transformer: 'rssTransformer',
      sourceName: 'Artforum',
      sourceId: 'artforum',
      url: 'https://www.artforum.com/rss.xml',
    },
    {
      transformer: 'rssTransformer',
      sourceName: 'LACMA',
      sourceId: 'lacma',
      url: 'https://www.lacma.org/rss.xml',
    },
    {
      transformer: 'rssTransformer',
      sourceName: 'Aesthetica',
      sourceId: 'aesthetica',
      url: 'https://aestheticamagazine.com/feed/',
    },
    {
      transformer: 'rssTransformer',
      sourceName: 'New Yorker Daily Cartoon',
      sourceId: 'newyorkercartoon',
      url: 'https://www.newyorker.com/feed/cartoons/daily-cartoon',
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
    {
      dict: 'index.events',
      href: '/events',
    },
  ],
  links: {
    github: 'https://github.com/derekphilipau/musefully',
  },
};
