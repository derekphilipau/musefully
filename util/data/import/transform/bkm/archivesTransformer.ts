import type { ArchiveDocument } from '@/types/archiveDocument';
import type { ElasticsearchTransformer } from '@/types/elasticsearchTransformer';
import { urlIdFormatter } from '../transformUtil';

/**
 * Return an array or a single value from a Dublin Core property.
 * If the property is an array, return a unique array of values.
 *
 * @param metadata Dublin Core metadata
 * @param property Name of the property
 * @returns Array of values or a single value
 */
function getDublinCoreProperty(metadata: any, property: string) {
  if (!metadata?.[property]) return undefined;
  if (Array.isArray(metadata?.[property])) {
    return [...new Set(metadata[property].map((o) => o['_']))];
  }
  return metadata[property]?.['_'];
}

function getDublinCoreUrlOrAccession(metadata: any, isAccession = true) {
  const id = getDublinCoreProperty(metadata, 'dc:identifier');
  if (id === undefined) return undefined;
  if (Array.isArray(id)) {
    if (isAccession) return id.find((id) => !id.startsWith('https'));
    return id.find((id) => id.startsWith('https'));
  }
  if (isAccession && !id.startsWith('https')) return id;
  if (!isAccession && id.startsWith('https')) return id;
  return undefined;
}

function getDublinCoreUrl(metadata: any) {
  return getDublinCoreUrlOrAccession(metadata, false);
}

function getDublinCoreId(metadata: any) {
  const url = getDublinCoreUrlOrAccession(metadata, false);
  if (url === undefined) return undefined;
  // Example URL:
  // "https://brooklynmuseum.libraryhost.com/repositories/2/archival_objects/29253"
  // Get the last part of the URL, the numeric ID, e.g. 29253
  return parseInt(url.split('/').pop());
}

function getDublinCoreAccession(metadata: any) {
  return getDublinCoreUrlOrAccession(metadata, true);
}

function getDates(metadata: any) {
  const date = getDublinCoreProperty(metadata, 'dc:date');
  // Date can be of form "1994", "1974 -- 1975", "1980-10", "1988-03-1988-05", "1988-1989"
  const match = /^(\d{4})-(\d{2})$/.exec(date);
  if (match?.length === 3) {
    // Date is of the form YYYY-MM:
    return {
      formattedDate: date,
      startYear: parseInt(match[1]),
      endYear: parseInt(match[1]),
    };
  }
  const match2 = /^(\d{4})-(\d{2})\s*-+\s*(\d{4})-(\d{2})$/.exec(date);
  if (match2?.length === 5) {
    // Date is of the form YYYY-MM-YYYY-MM:
    return {
      formattedDate: date,
      startYear: parseInt(match2[1]),
      endYear: parseInt(match2[3]),
    };
  }
  const match3 = /^(\d{4})\s*-+\s*(\d{4})$/.exec(date);
  if (match3?.length === 3) {
    // Date is of the form YYYY-YYYY or YYYY -- YYYY:
    return {
      formattedDate: date,
      startYear: parseInt(match3[1]),
      endYear: parseInt(match3[2]),
    };
  }
  const match4 = /^(\d{4})$/.exec(date);
  if (match4?.length === 2) {
    // Date is of the form YYYY:
    return {
      formattedDate: date,
      startYear: parseInt(match4[1]),
      endYear: parseInt(match4[1]),
    };
  }
  return undefined;
}

function getLanguage(metadata: any) {
  const language = getDublinCoreProperty(metadata, 'dc:language');
  if (Array.isArray(language)) {
    // filter elements equal to "Latn":
    const langs = language.filter((l) => l !== 'Latn');
    // Get a new array where elements that equal "eng" or "English" are replaced with "en":
    const langCodes = langs.map((l) => {
      if (l === 'eng' || l === 'English') return 'en';
      // TODO: Check for other languages
      return l;
    });
    if (langCodes?.length === 1) return langCodes[0];
    return langCodes;
  }
}

function transformDoc(doc: any): ArchiveDocument | undefined {
  const md = doc?.metadata?.['oai_dc:dc'];
  if (md === undefined) return undefined;

  const id = getDublinCoreId(md);
  const url = getDublinCoreUrl(md);
  const accessionNumber = getDublinCoreAccession(md);
  const dates = getDates(md);

  const searchText = accessionNumber;

  return {
    type: 'archives',
    source: 'bkm',
    url,
    id,
    title: getDublinCoreProperty(md, 'dc:title'),
    description: getDublinCoreProperty(md, 'dc:description'),
    searchText,
    accessionNumber,
    primaryConstituent: {
      name: getDublinCoreProperty(md, 'dc:creator'),
    },
    subject: getDublinCoreProperty(md, 'dc:subject'),
    language: getLanguage(md),
    publisher: getDublinCoreProperty(md, 'dc:publisher'),
    format: getDublinCoreProperty(md, 'dc:format'),
    rights: getDublinCoreProperty(md, 'dc:rights'),
    relation: getDublinCoreProperty(md, 'dc:relation'),
    formattedDate: dates?.formattedDate,
    startYear: dates?.startYear,
    endYear: dates?.endYear,
  } as ArchiveDocument;
}

export const transformer: ElasticsearchTransformer = {
  idGenerator: (doc: ArchiveDocument) => {
    return urlIdFormatter(doc.url);
  },
  documentTransformer: async (doc) => {
    return transformDoc(doc);
  },
};
