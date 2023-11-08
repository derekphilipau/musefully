import fs from 'fs';
import path from 'path';
import { parseStringPromise } from 'xml2js';

import {
  getRssItemId,
  getRssItemImageUrl,
  parseDate,
  transformRssItem,
} from '@/lib/import/ingesters/rss/util';
import { stripHtmlTags } from '@/lib/various';

describe('rss import function', () => {
  // Read the content of the RSS feed from the static file
  const testContent = fs.readFileSync(
    path.join(__dirname, './artnews.rss.xml'),
    'utf8'
  );

  let items: any[] = [];

  // Use beforeAll to process async operations before tests
  beforeAll(async () => {
    const jsonObj = await parseStringPromise(testContent);
    items = jsonObj.rss.channel[0].item;
  });

  it('should return image for content embedded', () => {
    const imageUrl = getRssItemImageUrl(items[0]);
    expect(imageUrl).toBe(
      'https://www.artnews.com/wp-content/uploads/2023/10/CNOLA_1986.0002.jpg?w=400'
    );
  });

  it("should return the rss item's id", () => {
    const itemId = getRssItemId(items[0]);
    console.log(itemId);
    expect(itemId).toBe('https://www.artnews.com/?p=1234682122');
  });

  it('should return the correct date', () => {
    const itemDate = parseDate(items[0]);
    expect(itemDate.toISOString()).toBe('2023-10-13T11:00:00.000Z');
  });

  it('should return the transformed rss', () => {
    const sourceId = 'artnews';
    const transformedItem = transformRssItem(items[0], sourceId);
    const strippedTitle = stripHtmlTags(
      'Why Cady Noland’s Disabling America Never Sat Quite Right With&#160;Me'
    );
    expect(transformedItem.sourceId).toBe(sourceId);
    expect(transformedItem.title).toBe(strippedTitle);
    expect(transformedItem.keywords).toBe('Art in America, Reviews');
  });
});
