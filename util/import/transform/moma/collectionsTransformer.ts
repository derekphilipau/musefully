import type { DocumentConstituent } from '@/types/baseDocument';
import type { CollectionObjectDocument } from '@/types/collectionObjectDocument';
import type { ElasticsearchTransformer } from '@/types/elasticsearchTransformer';
import { getStringValue, sourceAwareIdFormatter } from '../transformUtil';
import { searchUlanArtists } from '../ulan/searchUlanArtists';
import { collectionsTermsExtractor } from '../util/collectionsTermsExtractor';
import type { MomaDocument } from './types';
import { parseSignificantWords } from '../transformUtil';

const SOURCE_ID = 'moma';
const SOURCE_NAME = 'MoMA';
const OBJECT_TYPE = 'object';

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

/*
Couldn't find a way to reliably get the large image size, may need to scrape.
function getImage(doc) {
  if (doc.ThumbnailURL) {
    let regex = /\/media\/(.+)\.jpg/i;
    let matches = doc.ThumbnailURL.match(regex);

    if (matches && matches[1]) {
      const encodedObject = matches[1];
      let bufferObj = Buffer.from(encodedObject, 'base64');
      let decodedString = bufferObj.toString('utf8');
      let imageObject = JSON.parse(decodedString); // Add surrounding quotes to form valid JSON string
      if (imageObject?.[0]) {
        const imageId = imageObject[0]?.[1];
        const largeImageRequest = `[["f","${imageId}"],["p","convert","-quality 90 -resize 2000x2000\\u003e"]]`
        // base64 encode the request
        const largeImageRequestString = Buffer.from(
          largeImageRequest
        ).toString('base64').replace(/=+$/, '');;

        return {
          url: `https://www.moma.org/media/${largeImageRequestString}.jpg`,
          thumbnailUrl: doc.ThumbnailURL,
        };
      }
    }
  }
  return;
}
*/

function getImage(doc) {
  if (doc.ThumbnailURL) {
    return {
      url: doc.ThumbnailURL,
      thumbnailUrl: doc.ThumbnailURL,
    };
  }
  return;
}

async function transformDoc(doc: any): Promise<CollectionObjectDocument> {
  const esDoc: CollectionObjectDocument = {
    // Begin BaseDocument fields
    type: OBJECT_TYPE,
    source: SOURCE_NAME,
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

export const transformer: ElasticsearchTransformer = {
  sourceId: SOURCE_ID,
  sourceName: SOURCE_NAME,
  idGenerator: (
    doc: CollectionObjectDocument,
    includeSourcePrefix: boolean
  ) => {
    return sourceAwareIdFormatter(doc.id, SOURCE_ID, includeSourcePrefix);
  },
  documentTransformer: async (doc) => {
    return transformDoc(doc);
  },
  termsExtractor: async (doc: CollectionObjectDocument) => {
    return collectionsTermsExtractor(doc, SOURCE_NAME);
  },
};
