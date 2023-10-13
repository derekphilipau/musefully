import axios from 'axios';
import { load } from 'cheerio';
import { endOfMonth, formatISO, parse } from 'date-fns';

import type { ElasticsearchEventsCrawler } from '@/types/elasticsearchEventsCrawler';
import type { EventDocument } from '@/types/eventDocument';

const TYPE = 'exhibition';
const SOURCE = 'Brooklyn Museum';
const SOURCE_ID = 'bkm';

/**
 * ChatGPT in the house.
 * Parse numerous formats for a date range:
 * June 23–October 22, 2023
 * October 14, 2022–September 17, 2023
 * June 2–September 2023
 *
 * @param dateRange String representing a date range
 * @returns Start and end dates as ISO strings
 */
function decodeDates(dateRange: string) {
  try {
    const splitDateRange = dateRange.split('–');

    // Split the first part of the date range into month and day
    let startMonthName, startDay, startYear;
    if (splitDateRange[0].trim().includes(' ')) {
      [startMonthName, startDay] = splitDateRange[0].trim().split(' ');
    } else {
      startMonthName = splitDateRange[0].trim();
    }

    // Split the second part into either month and year or day and year
    let endMonthName, endDay, endYear;
    const endParts = splitDateRange[1].trim().split(' ');
    if (endParts.length === 2) {
      endMonthName = endParts[0];
      endYear = endParts[1];
    } else {
      [endMonthName, endDay, endYear] = endParts;
    }

    if (startDay) startDay = startDay.replace(',', '');
    if (endDay) endDay = endDay.replace(',', '');

    startDay = startDay || '1';
    if (!endDay) {
      // create a new date using 1st of endMonth
      const tmpDate = parse(
        `${endMonthName} 1, ${endYear}`,
        'MMMM d, yyyy',
        new Date()
      );
      // get the last day of the month
      endDay = endOfMonth(tmpDate).getDate();
    }

    // If startYear is undefined, use the endYear
    startYear = startYear || endYear;

    console.log(
      dateRange,
      startMonthName,
      startDay,
      startYear,
      endMonthName,
      endDay,
      endYear
    );

    // Parse the start and end dates
    const startDate = parse(
      `${startMonthName} ${startDay}, ${startYear}`,
      'MMMM d, yyyy',
      new Date()
    );
    const endDate = parse(
      `${endMonthName} ${endDay}, ${endYear}`,
      'MMMM d, yyyy',
      new Date()
    );

    return {
      startDate: formatISO(startDate),
      endDate: formatISO(endDate),
    };
  } catch (e) {
    // Expected error: Invalid Date due to wrong type of content
    return {};
  }
}

export async function crawl(): Promise<EventDocument[]> {
  const url = 'https://www.brooklynmuseum.org/exhibitions';
  const { data } = await axios.get(url);
  const $ = load(data);

  const exhibitions: EventDocument[] = [];

  $('.image-card').each((index, element) => {
    const titleElement = $(element).find('h2 > a');
    const title = titleElement.text().trim();
    const url = titleElement.attr('href') || '';
    const imageUrl = $(element).find('figure > a > img').attr('src') || '';
    // Remove two // from the beginning of the url
    const imageUrlCleaned = imageUrl?.replace(/^\/\//, 'https://');
    const formattedDate = $(element).find('h4').text().trim();
    const { startDate, endDate } = decodeDates(formattedDate);
    const location = $(element).find('h6').text().trim();

    if (title && url && startDate && endDate) {
      const exhibition: EventDocument = {
        type: TYPE,
        source: SOURCE,
        sourceId: SOURCE_ID,
        url,
        id: url,
        title,
        formattedDate,
        date: startDate,
        endDate: endDate,
        location,
      };
      if (imageUrlCleaned) {
        exhibition.image = {
          url: imageUrlCleaned,
          thumbnailUrl: imageUrlCleaned,
        };
      }
      console.log(exhibition);
      exhibitions.push(exhibition);
    }
  });

  console.log(exhibitions);

  return exhibitions;
}

export const crawler: ElasticsearchEventsCrawler = {
  crawl: async () => {
    return crawl();
  },
};
