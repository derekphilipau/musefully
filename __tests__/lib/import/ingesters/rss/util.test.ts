import fs from 'fs';
import path from 'path';
import { parseStringPromise } from 'xml2js';

import { getRssItemImageUrl } from '@/lib/import/ingesters/rss/util';

describe('normalizeName function', () => {
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

  it(`should return image for content embedded`, () => {
    const imageUrl = getRssItemImageUrl(items[0]);
    console.log('yyy', imageUrl);
    expect(imageUrl).toBe(
      'https://www.artnews.com/wp-content/uploads/2023/10/CNOLA_1986.0002.jpg?w=400'
    );
  });
});
