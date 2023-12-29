import { type } from 'os';
import { format, getYear, isValid, parse } from 'date-fns';
import { parseStringPromise } from 'xml2js';

import type { BaseDocument, DocumentConstituent } from '@/types/document';
import { stripHtmlTags } from '@/lib/various';

/**
 * Sometimes RSS feeds contain invalid XML characters, such as '&', e.g.:
 * <category domain="http://www.nytimes.com/namespaces/keywords/nyt_org">Hauser & Wirth</category>
 *
 * @param xmlStr XML string
 * @returns XML string with invalid characters escaped
 */
export function escapeXmlInvalidChars(xmlStr: string): string {
  const regex = /&(?!amp;|lt;|gt;|quot;|apos;|#\d+;)/g;
  return xmlStr.replace(regex, '&amp;');
}

/**
 * Parse an XML string into a JSON object
 *
 * @param xmlString XML string
 * @returns JSON object
 */
export async function parseXml(xmlString: string): Promise<any> {
  // Parse the XML string using xml2js
  const jsonObj = await parseStringPromise(escapeXmlInvalidChars(xmlString));
  return jsonObj;
}

/**
 * Get the image url from the rss item, either from the description or the content
 * @param item RSS <item> element
 * @returns string representing URL of image
 */
export function getRssItemImageUrl(item: any): string | undefined {
  const mediaContentUrl = item['media:content']?.[0]?.['$']?.url;
  if (mediaContentUrl) return mediaContentUrl;

  const mediaThumbnailUrl = item['media:thumbnail']?.[0]?.['$']?.url;
  if (mediaThumbnailUrl) return mediaThumbnailUrl;

  // RSS enclosures are a way of attaching multimedia content to RSS feeds by providing the URL of a file associated with an entry
  const enclosureUrl = item.enclosure?.[0]?.['$']?.url;
  if (enclosureUrl) return enclosureUrl;

  const description = item.description?.[0];
  const content = item['content:encoded'] ? item['content:encoded'][0] : '';

  const regex = /<img.*?src="(.*?)".*?>/;

  const descriptionMatch = description?.match(regex);
  const contentMatch = content?.match(regex);

  if (descriptionMatch?.length === 2) return descriptionMatch[1];

  if (contentMatch?.length === 2) return contentMatch[1];
}

export function getRssItemId(item: any) {
  if (item.guid?.[0]?._) return item.guid[0]._;
  if (item.link?.[0]) return item.link[0];
}

export function getRssConstituent(item: any) {
  const creator = item['dc:creator']?.[0];
  if (creator) {
    return {
      name: creator,
      canonicalName: creator,
      role: 'Author',
    } as DocumentConstituent;
  }
}

export function parseDate(item: any): Date {
  const dateFormats = [
    "EEE, dd MMM yyyy HH:mm:ss 'GMT'",
    'EEE, dd MMM yyyy HH:mm:ss xx',
    'yyyy-MM-dd HH:mm:ss',
  ];
  const dateString = item.pubDate?.[0] || item['dc:date']?.[0];
  if (dateString) {
    for (const format of dateFormats) {
      const date = parse(dateString, format, new Date());
      if (isValid(date)) return date;
    }
  }
  throw new Error('RSS Item Date could not be parsed');
}

/**
 * Two cases:
 * 1. Array of categories with string values:
 * <category><![CDATA[Art in America]]></category>
 * 2. Array of categories with object values:
 * <category domain="http://www.nytimes.com/namespaces/keywords/des">Art</category>
 *
 * @param item RSS <item> element
 * @returns string[] of categories
 */
export function getItemCategories(item: any): string[] | undefined {
  if (!item.category || !(item.category.length > 0)) return undefined;
  const categories = item.category?.map((c: any) => {
    if (typeof c === 'string') return c;
    if (typeof c === 'object' && c._) return c._;
  });
  return categories;
}

/**
 * Transform a typical RSS item into a BaseDocument
 *
 * @param item RSS <item> element
 * @param sourceId ID of the source
 * @returns Elasticsearch BaseDocument
 */
export function transformRssItem(item: any, sourceId: string) {
  const title = stripHtmlTags(item.title?.[0]);
  const description = stripHtmlTags(item.description?.[0]);
  const searchText = stripHtmlTags(item['content:encoded']?.[0]);
  const date = parseDate(item);
  const year = date ? getYear(date) : undefined;
  const thumbnailUrl = getRssItemImageUrl(item);
  const primaryConstituent = getRssConstituent(item);

  return {
    type: 'rss',
    sourceId: sourceId,
    id: getRssItemId(item),
    url: item.link?.[0],
    title,
    description,
    searchText,
    keywords: getItemCategories(item),
    image: {
      url: thumbnailUrl,
      thumbnailUrl: thumbnailUrl,
    },
    primaryConstituent,
    date: date ? date.toISOString() : undefined,
    formattedDate: format(date, 'MMMM do, yyyy'),
    startYear: year,
    endYear: year,
  } as BaseDocument;
}
