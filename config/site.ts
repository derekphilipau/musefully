import type { NavItem } from '@/types/nav';

export interface GoogleSheetConfig {
  sheetName: string; // Name of sheet
  indexName: string; // Name of index to populate
  typeName: string; // Type of document
}

/**
 * Represents an RSS feed with necessary information for ingestion.
 */
export interface RssFeedConfig {
  ingester: string; // Transformer to use, typically rssIngester
  sourceName: string; // Human-readable name
  sourceId: string; // ID of source
  url: string; // URL of RSS feed
}

export interface ExhibitionUrl {
  url: string; // URL of exhibition web page
  source: string; // Human-readable name of source
  sourceId: string; // ID of source
  baseUrl: string; // Base URL of source
}

/**
 * Represents the site configuration.
 */
interface SiteConfig {
  defaultLocale: string; // Default locale for the site.  Currently only en supported.
  isMultiSource: boolean; // Whether the site is multi-source.
  ingesters: string[]; // List of ingesters
  extractors: string[]; // List of extractors in /util/import/extract/ directory
  exhibitionUrls: ExhibitionUrl[]; // List of exhibition URLs
  googleSheets: GoogleSheetConfig[]; // List of Google sheets to ingest
  rssFeeds: RssFeedConfig[]; // List of RSS feeds to ingest
  mainNav: NavItem[]; // List of nav items
  links?: {
    // List of secondary/social links
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
    'cma/collectionsIngester',
    'bkm/collectionsIngester',
    'moma/collectionsIngester',
    'whitney/collectionsIngester',
    'met/collectionsIngester',
  ],
  extractors: ['openAiExhibitionsExtractor'],
  exhibitionUrls: [
    {
      url: 'https://www.moma.org/calendar/exhibitions/',
      source: 'MoMA',
      sourceId: 'moma',
      baseUrl: 'https://www.moma.org',
    },
    {
      url: 'https://www.brooklynmuseum.org/exhibitions',
      source: 'Brooklyn Museum',
      sourceId: 'bkm',
      baseUrl: 'https://www.brooklynmuseum.org',
    },
    {
      url: 'https://www.metmuseum.org/exhibitions',
      source: 'Metropolitan Museum of Art',
      sourceId: 'met',
      baseUrl: 'https://www.metmuseum.org',
    },
    {
      url: 'https://www.lacma.org/art/exhibitions/current',
      source: 'LACMA',
      sourceId: 'lacma',
      baseUrl: 'https://www.lacma.org',
    },
    {
      url: 'https://www.lacma.org/art/exhibitions/coming-soon',
      source: 'LACMA',
      sourceId: 'lacma',
      baseUrl: 'https://www.lacma.org',
    },
    {
      url: 'https://www.artic.edu/exhibitions',
      source: 'Art Institute of Chicago',
      sourceId: 'aic',
      baseUrl: 'https://www.artic.edu',
    },
    {
      url: 'https://www.nga.gov/exhibitions/current.html',
      source: 'National Gallery of Art',
      sourceId: 'nga',
      baseUrl: 'https://www.nga.gov',
    },
    {
      url: 'https://www.nga.gov/exhibitions/upcoming.html',
      source: 'National Gallery of Art',
      sourceId: 'nga',
      baseUrl: 'https://www.nga.gov',
    },
    {
      url: 'https://whitney.org/exhibitions',
      source: 'Whitney Museum of American Art',
      sourceId: 'whitney',
      baseUrl: 'https://whitney.org',
    },
    {
      url: 'https://hirshhorn.si.edu/exhibitions-events/',
      source: 'Hirshhorn Museum and Sculpture Garden',
      sourceId: 'hirshhorn',
      baseUrl: 'https://hirshhorn.si.edu',
    },
    {
      url: 'https://philamuseum.org/calendar/view-all/all/exhibitions',
      source: 'Philadelphia Museum of Art',
      sourceId: 'pma',
      baseUrl: 'https://philamuseum.org',
    },
  ],
  googleSheets: [
    {
      sheetName: 'exhibitions',
      indexName: 'events',
      typeName: 'exhibition',
    },
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
    /*
    LACMA is using their RSS feed for all events, filling up the timeline.
    {
      ingester: 'rssIngester',
      sourceName: 'LACMA',
      sourceId: 'lacma',
      url: 'https://www.lacma.org/rss.xml',
    },
    */
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
