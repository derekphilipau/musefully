import fs from 'fs';
import path from 'path';

import {
  getRssItemId,
  getRssItemImageUrl,
  parseDate,
  parseXml,
  transformRssItem,
} from '@/lib/import/ingesters/rss/util';
import { stripHtmlTags } from '@/lib/various';

describe('transformRssItem', () => {
  // Read the content of the RSS feed from the static file
  const testContent = fs.readFileSync(
    path.join(__dirname, './artnews.rss.xml'),
    'utf8'
  );

  let items: any[] = [];
  let nytItemXml: any = {};

  // Use beforeAll to process async operations before tests
  beforeAll(async () => {
    const jsonObj = await parseXml(testContent);
    items = jsonObj.rss.channel[0].item;

    const nytItemRss = `
    <item>
      <title>How 1993 — and Two Watershed Shows — Help Make Sense of 2023</title>
      <link>https://www.nytimes.com/2023/12/27/arts/design/1993-whitney-biennial-theater-of-refusal-art.html</link>
      <guid isPermaLink="true">https://www.nytimes.com/2023/12/27/arts/design/1993-whitney-biennial-theater-of-refusal-art.html</guid>
      <atom:link href="https://www.nytimes.com/2023/12/27/arts/design/1993-whitney-biennial-theater-of-refusal-art.html" rel="standout"/>
      <description>A blue-chip gallery asks, does the infamous Whitney Biennial or “The Theater of Refusal” measure up 30 years later, when artists of color have moved to the mainstream?</description>
      <dc:creator>Aruna D’Souza</dc:creator>
      <pubDate>Wed, 27 Dec 2023 16:51:11 +0000</pubDate>
      <category domain="http://www.nytimes.com/namespaces/keywords/des">Art</category>
      <category domain="http://www.nytimes.com/namespaces/keywords/des">Photography</category>
      <category domain="http://www.nytimes.com/namespaces/keywords/des">Race and Ethnicity</category>
      <category domain="http://www.nytimes.com/namespaces/keywords/nyt_org">Hauser & Wirth</category>
      <category domain="http://www.nytimes.com/namespaces/keywords/nyt_per">Fowle, Kate</category>
      <category domain="http://www.nytimes.com/namespaces/keywords/nyt_geo">Los Angeles (Calif)</category>
      <category domain="http://www.nytimes.com/namespaces/keywords/nyt_per">Gaines, Charles</category>
      <category domain="http://www.nytimes.com/namespaces/keywords/nyt_org">Whitney Museum of American Art</category>
      <category domain="http://www.nytimes.com/namespaces/keywords/nyt_org">University of California</category>
    </item>`;
    nytItemXml = (await parseXml(nytItemRss))?.item;
  });

  it('should return image for content embedded', () => {
    const imageUrl = getRssItemImageUrl(items[0]);
    expect(imageUrl).toBe(
      'https://www.artnews.com/wp-content/uploads/2023/10/CNOLA_1986.0002.jpg?w=400'
    );
  });

  it("should return the rss item's id", () => {
    const itemId = getRssItemId(items[0]);
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
    expect(transformedItem.keywords).toEqual(['Art in America', 'Reviews']);
  });

  it('should return the transformed rss for nytimes', () => {
    const sourceId = 'nytimes';
    const transformedItem = transformRssItem(nytItemXml, sourceId);
    expect(transformedItem.sourceId).toBe(sourceId);
    expect(transformedItem.title).toBe(
      'How 1993 — and Two Watershed Shows — Help Make Sense of 2023'
    );
    expect(transformedItem.keywords).toEqual([
      'Art',
      'Photography',
      'Race and Ethnicity',
      'Hauser & Wirth',
      'Fowle, Kate',
      'Los Angeles (Calif)',
      'Gaines, Charles',
      'Whitney Museum of American Art',
      'University of California',
    ]);
  });
});
