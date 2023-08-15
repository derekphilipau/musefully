import { stripHtmlTags } from '@/util/various';
import { format, getYear, isValid, parse } from 'date-fns';

import type { BaseDocument, DocumentConstituent } from '@/types/baseDocument';

/**
 * Get the image url from the rss item, either from the description or the content
 * @param item RSS <item> element
 * @returns string representing URL of image
 */
function getRssItemImageUrl(item: any): string | undefined {
  const mediaContentUrl = item['media:content']?.[0]?.['$']?.url;
  if (mediaContentUrl) return mediaContentUrl;

  const mediaThumbnailUrl = item['media:thumbnail']?.[0]?.['$']?.url;
  if (mediaThumbnailUrl) return mediaThumbnailUrl;

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

function getRssConstituent(item: any) {
  const creator = item['dc:creator']?.[0];
  if (creator) {
    return {
      name: creator,
      canonicalName: creator,
      role: 'Author',
    } as DocumentConstituent;
  }
}

function parseDate(item: any): Date {
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
 * Transform a typical RSS item into a BaseDocument
 *
 * @param item RSS <item> element
 * @param sourceName Source of RSS feed, e.g. 'hyperallergic'
 * @returns Elasticsearch BaseDocument
 */
export function transformRssItem(
  item: any,
  sourceName: string,
  sourceId: string
) {
  const title = stripHtmlTags(item.title?.[0]);
  const description = stripHtmlTags(item.description?.[0]);
  const searchText = stripHtmlTags(item['content:encoded']?.[0]);
  const date = parseDate(item);
  const year = date ? getYear(date) : undefined;
  const thumbnailUrl = getRssItemImageUrl(item);
  const primaryConstituent = getRssConstituent(item);

  return {
    type: 'rss',
    source: sourceName,
    sourceId: sourceId,
    id: getRssItemId(item),
    url: item.link?.[0],
    title,
    description,
    searchText,
    keywords: item.category?.length ? item.category.join(', ') : undefined,
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
