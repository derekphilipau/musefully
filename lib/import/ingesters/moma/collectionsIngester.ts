import type { ArtworkDocument, DocumentConstituent } from '@/types/document';
import type { ElasticsearchIngester } from '@/types/elasticsearchIngester';
import { searchUlanArtists } from '@/lib/import/ulan/searchUlanArtists';
import { sources } from '@/config/sources';
import { artworkTermsExtractor } from '../artworkTermsExtractor';
import {
  getStringValue,
  parseSignificantWords,
  sourceAwareIdFormatter,
} from '../ingestUtil';
import type { MomaDocument } from './types';

const DATA_FILE = './data/moma/collections.jsonl.gz';
const INDEX_NAME = 'art';
const SOURCE_ID = 'moma';
const DOC_TYPE = 'artwork';

interface YearRange {
  startYear: number | null;
  endYear: number | null;
}

// Examples: "1978-80", "c. 1960", "Before 1946", "Unknown", "1920s", "1930\u20131932", "c. 1932-66", "Designed 1925 (this example 1953)"
function getDates(doc: MomaDocument): YearRange {
  if (!doc.Date) return { startYear: null, endYear: null };
  const date = doc.Date;

  // Any two numbers of 2-4 digits each separated by at least one character:
  const rangeMatch = date.match(/(\d{4}).+(\d{2,4})/);
  if (rangeMatch) {
    // "1978-80", "1930\u20131932", "c. 1932-66", "Designed 1925 (this example 1953)"
    const startYear = parseInt(rangeMatch[1]);
    let endYear = parseInt(rangeMatch[2]);
    if (startYear > 1000 && endYear < 100) {
      // If the first year is 4 digits and the second is 2, assume the second year is in same century as first.
      // Get the century of the first year and add it to the second year:
      endYear += Math.floor(startYear / 100) * 100;
    }
    return { startYear, endYear };
  }
  const decadeMatch = date.match(/(\d{4})'?(s)/); // 1920s or 1920's
  if (decadeMatch) {
    const startYear = parseInt(decadeMatch[1]);
    const endYear = startYear + 9;
    return { startYear, endYear };
  }
  const singleYearMatch = date.match(/(\d{4})/);
  if (singleYearMatch) {
    const startYear = parseInt(singleYearMatch[1]);
    const endYear = startYear;
    return { startYear, endYear };
  }
  return { startYear: null, endYear: null };
}

function getArtists(doc: MomaDocument): DocumentConstituent[] {
  if (!doc.Artist || !(doc.Artist?.length > 0)) return [];
  const artists: DocumentConstituent[] = [];
  for (let i = 0; i < doc.Artist.length; i++) {
    const artist: DocumentConstituent = {
      name: doc.Artist[i],
      canonicalName: doc.Artist[i],
    };
    if (doc.ConstituentID?.[i])
      artist.id = getStringValue(doc.ConstituentID[i]);
    if (doc.ArtistBio?.[i]) artist.dates = doc.ArtistBio[i];
    if (doc.Nationality?.[i]) artist.nationality = [doc.Nationality[i]];
    if (doc.BeginDate?.[i]) artist.birthYear = doc.BeginDate[i];
    if (doc.EndDate?.[i]) artist.deathYear = doc.EndDate[i];
    if (doc.Gender?.[i]) artist.gender = doc.Gender[i];
    artists.push(artist);
  }
  return artists;
}

function getImage(doc) {
  if (doc.ThumbnailURL) {
    return {
      url: doc.ThumbnailURL,
      thumbnailUrl: doc.ThumbnailURL,
    };
  }
  return;
}

async function transformDoc(doc: any): Promise<ArtworkDocument> {
  const esDoc: ArtworkDocument = {
    // Begin BaseDocument fields
    type: DOC_TYPE,
    source: sources[SOURCE_ID]?.name,
    sourceId: SOURCE_ID,
    id: getStringValue(doc.ObjectID),
    title: doc.Title || undefined,
  };
  // esDoc.description = X; unused at moma

  if (doc.AccessionNumber) {
    esDoc.accessionNumber = doc.AccessionNumber; // "14.301a-e"
    esDoc.searchText = doc.AccessionNumber;
  }
  if (doc.DateAcquired)
    esDoc.accessionDate = new Date(doc.DateAcquired).toISOString();

  if (doc.Date) {
    esDoc.formattedDate = doc.Date; // "18th century"
    const { startYear, endYear } = getDates(doc);
    if (startYear !== null) esDoc.startYear = startYear;
    if (endYear !== null) esDoc.endYear = endYear;
  }

  if (doc.Medium) {
    // Medium is a free-form comma-delimited list of materials.  Split it into an array.
    // The array of materials is stored in the medium field,
    // while the entire string is stored in the formattedMedium field.
    esDoc.formattedMedium = doc.Medium;
    esDoc.medium = parseSignificantWords(doc.Medium);
  }

  if (doc.CreditLine) esDoc.creditLine = doc.CreditLine;
  if (doc.Classification) esDoc.classification = doc.Classification;
  if (doc.Department) esDoc.departments = [doc.Department];

  const artists = getArtists(doc);
  if (artists.length) {
    esDoc.constituents = artists;
    // Assume first artist is "primary"
    const ulanArtist = await searchUlanArtists(
      esDoc.constituents[0].name,
      esDoc.constituents[0].birthYear,
      esDoc.constituents[0].deathYear
    );
    if (ulanArtist?.preferredTerm) {
      esDoc.constituents[0].canonicalName = ulanArtist.preferredTerm;
      esDoc.constituents[0].ulan = ulanArtist;
    }
    esDoc.primaryConstituent = artists[0];
  }

  if (doc.Dimensions) {
    esDoc.dimensions = doc.Dimensions;
    // TODO: "Depth (cm)": 20.0, "Height (cm)": 4.5, "Width (cm)": 24.6
  }
  if (doc.URL) esDoc.url = doc.URL;

  const image = getImage(doc);
  if (image) esDoc.image = image;

  return esDoc;
}

export const ingester: ElasticsearchIngester = {
  indexName: INDEX_NAME,
  dataFilename: DATA_FILE,
  sourceId: SOURCE_ID,
  generateId: (doc: ArtworkDocument, includeSourcePrefix: boolean) => {
    return sourceAwareIdFormatter(doc.id, SOURCE_ID, includeSourcePrefix);
  },
  transform: async (doc) => {
    return transformDoc(doc);
  },
  extractTerms: async (doc: ArtworkDocument) => {
    return artworkTermsExtractor(doc, sources[SOURCE_ID]);
  },
};
