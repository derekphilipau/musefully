import { format } from 'date-fns';

import type { BaseDocument } from '@/types/document';
import { sources } from '@/config/sources';

/**
 * Function type for generating an ID for Elasticsearch documents.
 * For RSS documents, the ID is usually just the URL.
 */
export interface GoogleSheetIdGenerator {
  (doc: BaseDocument): string;
}

/**
 * Function type for transforming any document to a `BaseDocument`.
 */
export interface GoogleSheetTransform {
  (doc: any, typeName: string): BaseDocument | undefined;
}

export interface SheetRowData {
  url: string;
  source: string;
  sourceId: string;
  title: string;
  description: string;
  imageUrl: string;
  formattedDate: string;
  startDate: string;
  endDate: string;
  location: string;
}

/**
 * Defines the structure of an Elasticsearch transformer, with all functions required
 * to transform data for use in Elasticsearch.
 */
export interface GoogleSheetIngester {
  generateId: GoogleSheetIdGenerator;
  transform: GoogleSheetTransform;
}

export const ingester: GoogleSheetIngester = {
  generateId: (doc: BaseDocument) => {
    return doc.url || '';
  },
  transform: (item, typeName) => {
    let startYear, endYear, formattedStartDate, formattedEndDate;
    let startDate = item.get('startDate')
      ? new Date(item.get('startDate'))
      : null;
    let endDate = item.get('endDate') ? new Date(item.get('endDate')) : null;
    if (startDate) {
      startYear = startDate.getFullYear();
      formattedStartDate = format(startDate, 'yyyy-MM-dd');
    }
    if (endDate) {
      endYear = endDate.getFullYear();
      formattedEndDate = format(endDate, 'yyyy-MM-dd');
    }
    if (!startYear && endYear) startYear = endYear;
    if (!endYear && startYear) endYear = startYear;

    console.log('formatted: ', formattedStartDate, formattedEndDate);
    return {
      type: typeName,
      source: sources[item.get('sourceId')]?.name,
      sourceId: item.get('sourceId'),
      url: item.get('url'),
      title: item.get('title'),
      description: item.get('description'),
      image: {
        url: item.get('imageUrl,'),
        thumbnailUrl: item.get('imageUrl'),
      },
      date: formattedStartDate,
      endDate: formattedEndDate,
      startYear,
      endYear,
      location: sources[item.get('sourceId')]?.location,
      museumLocation: item.get('museumLocation'),
    } as BaseDocument;
  },
};
