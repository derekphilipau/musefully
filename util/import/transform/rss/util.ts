import { format, getYear, isValid, parse } from 'date-fns';
import { stripHtmlTags } from '@/util/various';
import type { BaseDocument } from '@/types/baseDocument';

/**
 * Get the image url from the rss item, either from the description or the content
 * @param item RSS <item> element
 * @returns string representing URL of image
 */
function getRssItemImageUrl(item: any): string | undefined {
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

const dateFormats = [
  "EEE, dd MMM yyyy HH:mm:ss 'GMT'",
  'EEE, dd MMM yyyy HH:mm:ss xx',
];

function parseDate(dateString: string): Date {
  for (const format of dateFormats) {
    const date = parse(dateString, format, new Date());
    if (isValid(date)) return date;
  }
  throw new Error('RSS Item Date could not be parsed');
}

/**
 * Transform a typical RSS item into a BaseDocument
 *
 * @param item RSS <item> element
 * @param source Source of RSS feed, e.g. 'hyperallergic'
 * @returns Elasticsearch BaseDocument
 */
export function transformRssItem(item: any, source: string) {
  const date = parseDate(item.pubDate?.[0]);
  const year = getYear(date);
  const thumbnailUrl = getRssItemImageUrl(item);
  const contentEncoded = item['content:encoded']?.length ? item['content:encoded'][0] : '';
  const contentText = stripHtmlTags(contentEncoded);

  return {
    type: 'rss',
    source: source,
    id: getRssItemId(item),
    url: item.link?.[0],
    title: item.title?.[0],
    description: item.description?.[0],
    searchText: contentText,
    keywords: item.category?.length ? item.category.join(', ') : undefined,
    image: {
      url: thumbnailUrl,
      thumbnailUrl: thumbnailUrl,
    },
    date: date ? date.toISOString() : undefined,
    formattedDate: format(date, 'MMMM do, yyyy'),
    startYear: year,
    endYear: year,
  } as BaseDocument;
}
