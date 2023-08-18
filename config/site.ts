import type { NavItem } from '@/types/nav';

/**
 * Represents an RSS feed with necessary information for ingestion.
 */
export interface RssFeedConfig {
  /** Transformer to use, typically rssIngester */
  ingester: string;
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
  /** List of crawlers in /util/import/crawl/events/ directory */
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
      ingester: 'rssIngester',
      sourceName: 'Hyperallergic',
      sourceId: 'hyperallergic',
      url: 'https://hyperallergic.com/feed/',
    },
    {
      ingester: 'rssIngester',
      sourceName: 'MoMA',
      sourceId: 'moma',
      url: 'https://stories.moma.org/feed',
    },
    {
      ingester: 'rssIngester',
      sourceName: 'Cooper Hewitt',
      sourceId: 'cooperhewitt',
      url: 'https://www.cooperhewitt.org/blog/feed/',
    },
    {
      ingester: 'rssIngester',
      sourceName: 'V&A',
      sourceId: 'vam',
      url: 'https://www.vam.ac.uk/blog/feed',
    },
    {
      ingester: 'rssIngester',
      sourceName: 'Seattle Art Museum',
      sourceId: 'sam',
      url: 'https://samblog.seattleartmuseum.org/feed/',
    },
    {
      ingester: 'rssIngester',
      sourceName: 'Milwaukee Art Museum',
      sourceId: 'mam',
      url: 'https://blog.mam.org/feed/',
    },
    {
      ingester: 'rssIngester',
      sourceName: 'ARTnews',
      sourceId: 'artnews',
      url: 'https://www.artnews.com/feed/',
    },
    {
      ingester: 'rssIngester',
      sourceName: 'NYT Art & Design',
      sourceId: 'nyt',
      url: 'https://rss.nytimes.com/services/xml/rss/nyt/ArtandDesign.xml',
    },
    {
      ingester: 'rssIngester',
      sourceName: 'The Met',
      sourceId: 'met',
      url: 'https://www.metmuseum.org/blogs?rss=1',
    },
    {
      ingester: 'rssIngester',
      sourceName: 'Artsy',
      sourceId: 'artsy',
      url: 'https://www.artsy.net/rss/news',
    },
    {
      ingester: 'rssIngester',
      sourceName: 'Colossal',
      sourceId: 'colossal',
      url: 'https://www.thisiscolossal.com/feed/',
    },
    {
      ingester: 'rssIngester',
      sourceName: 'Hi-Fructose',
      sourceId: 'hifructose',
      url: 'https://hifructose.com/feed/',
    },
    {
      ingester: 'rssIngester',
      sourceName: 'Juxtapoz',
      sourceId: 'juxtapoz',
      url: 'https://www.juxtapoz.com/news/?format=feed&type=rss',
    },
    {
      ingester: 'rssIngester',
      sourceName: 'Artforum',
      sourceId: 'artforum',
      url: 'https://www.artforum.com/rss.xml',
    },
    {
      ingester: 'rssIngester',
      sourceName: 'LACMA',
      sourceId: 'lacma',
      url: 'https://www.lacma.org/rss.xml',
    },
    {
      ingester: 'rssIngester',
      sourceName: 'Aesthetica',
      sourceId: 'aesthetica',
      url: 'https://aestheticamagazine.com/feed/',
    },
    {
      ingester: 'rssIngester',
      sourceName: 'New Yorker Daily Cartoon',
      sourceId: 'newyorkercartoon',
      url: 'https://www.newyorker.com/feed/cartoons/daily-cartoon',
    },
  ],
  mainNav: [
    {
      dict: 'index.art',
      basePath: 'art',
      href: '/art?hasPhoto=true&f=true',
    },
    {
      dict: 'index.news',
      basePath: 'news',
      href: '/news',
    },
    {
      dict: 'index.events',
      basePath: 'events',
      href: '/events',
    },
  ],
  links: {
    github: 'https://github.com/derekphilipau/musefully',
  },
};
