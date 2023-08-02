import { format, parse, getYear } from 'date-fns';

import type { BaseDocument } from '@/types/baseDocument';
import type { ElasticsearchRssTransformer } from '@/types/elasticsearchRssTransformer';

const URL = 'https://hyperallergic.com/feed/';

function getImageUrl(item: any): string | undefined {
  const description = item.description[0];
  const content = item['content:encoded'] ? item['content:encoded'][0] : '';

  // Use a regular expression to find the src attribute of the img tag
  const regex = /<img.*?src="(.*?)".*?>/;

  const descriptionMatch = description.match(regex);
  const contentMatch = content.match(regex);

  if (descriptionMatch && descriptionMatch[1]) {
    console.log('Thumbnail from description:', descriptionMatch[1]);
    return descriptionMatch[1];
  }

  if (contentMatch && contentMatch[1]) {
    console.log('Thumbnail from content:', contentMatch[1]);
    return contentMatch[1];
  }
}

export const transformer: ElasticsearchRssTransformer = {
  url: URL,
  idGenerator: (doc: BaseDocument) => {
    return doc?.url || '';
  },
  documentTransformer: async (item) => {
    // <pubDate>Wed, 02 Aug 2023 21:40:48 +0000</pubDate>
    const date = parse(item.pubDate?.[0], 'EEE, dd MMM yyyy HH:mm:ss xx', new Date());
    const year = getYear(date);
    const thumbnailUrl = getImageUrl(item);
    return {
      type: 'rss',
      source: 'hyperallergic',
      url: item.link[0],
      id: item.guid[0]._,
      title: item.title[0],
      description: item.description[0],
      searchText: item.title[0] + ' ' + item.description[0],
      keywords: item.category.join(', '),
      image: {
        url: thumbnailUrl,
        thumbnailUrl: thumbnailUrl,
      },
      date: date.toISOString(),
      formattedDate: format(date, 'MMMM do, yyyy'),
      startYear: year,
      endYear: year,
    } as BaseDocument;
  },
};
