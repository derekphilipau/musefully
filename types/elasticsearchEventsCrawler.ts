import type { EventDocument } from './document';

/**
 * Function type for crawling web resources and returning arrays of `BaseDocument`.
 */
export interface ElasticsearchEventDocumentsCrawler {
  (): Promise<EventDocument[] | undefined>;
}

/**
 * Defines the structure of a crawler, with all functions required
 * to crawl & extract data for use in Elasticsearch.
 */
export interface ElasticsearchEventsCrawler {
  crawl: ElasticsearchEventDocumentsCrawler;
}
