import type { BaseDocument } from '@/types/document';

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
};

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
    let startDate = item.startDate ? new Date(item.startDate) : null;
    let endDate = item.endDate ? new Date(item.endDate) : null;
    let startYear = startDate ? startDate.getFullYear() : null;
    let endYear = endDate ? endDate.getFullYear() : null;
    if (!startYear && endYear) startYear = endYear;
    if (!endYear && startYear) endYear = startYear;
    return {
      type: typeName,
      source: item.get('source'),
      sourceId: item.get('sourceId'),
      url: item.get('url'),
      title: item.get('title'),
      description: item.get('description'),
      image: {
        url: item.get('imageUrl,'),
        thumbnailUrl: item.get('imageUrl'),
      },
      date: startDate?.toISOString(),
      endDate: endDate?.toISOString(),
      startYear,
      endYear,
      location: item.get('location'),
    } as BaseDocument;
  },
};
