import axios from 'axios';
import { load } from 'cheerio';

import type {
  ArtworkDocument,
  DocumentConstituent,
  DocumentGeographicalLocation,
  DocumentImage,
} from '@/types/document';
import type { ElasticsearchIngester } from '@/types/elasticsearchIngester';
import countryByContinent from '@/lib/country-by-continent.json';
import { searchUlanArtistById } from '@/lib/import/ulan/searchUlanArtists';
import { getBooleanValue, snooze } from '@/lib/various';
import { artworkTermsExtractor } from '../artworkTermsExtractor';
import {
  getStringValue,
  parseSignificantWords,
  sourceAwareIdFormatter,
} from '../ingestUtil';
import type { MetDocument } from './types';

const DATA_FILE = './data/met/MetObjects.csv.gz';
const INDEX_NAME = 'art';
const SOURCE_ID = 'met';
const SOURCE_NAME = 'The Met';
const DOC_TYPE = 'artwork';

function getKeywords(doc: MetDocument): string | undefined {
  const keywords = doc['Tags']?.split('|').map((s) => s.trim());
  if (keywords?.length) return keywords.join(', ');
}

async function getConstituents(
  doc: MetDocument
): Promise<DocumentConstituent[]> {
  // Values are separated by "|", e.g. "Pablo Picasso|Georges Braque"
  // Always trim, fields may have some extra spaces
  const artistNames = doc['Artist Display Name']
    .split('|')
    .map((s) => s.trim());
  const artistIds = doc['ConstituentID']?.split('|').map((s) => s.trim());
  const artistRoles = doc['Artist Role'].split('|').map((s) => s.trim());
  const artistPrefixes = doc['Artist Prefix']?.split('|').map((s) => s.trim());
  const artistBios = doc['Artist Display Bio']?.split('|').map((s) => s.trim());
  const artistSuffixes = doc['Artist Suffix']?.split('|').map((s) => s.trim());
  const artistNationalities = doc['Artist Nationality']
    ?.split('|')
    .map((s) => s.trim());
  const artistBeginDates = doc['Artist Begin Date']
    ?.split('|')
    .map((s) => s.trim());
  const artistEndDates = doc['Artist End Date']
    ?.split('|')
    .map((s) => s.trim());
  const artistGenders = doc['Artist Gender']?.split('|').map((s) => s.trim());
  const artistULANURLs = doc['Artist ULAN URL']
    ?.split('|')
    .map((s) => s.trim());
  const artistWikidataURLs = doc['Artist Wikidata URL']
    ?.split('|')
    .map((s) => s.trim());

  const constituents: DocumentConstituent[] = [];

  for (let i = 0; i < artistNames.length; i++) {
    if (!artistNames[i]) continue;
    const constituent: DocumentConstituent = {
      name: artistNames[i],
      canonicalName: artistNames[i],
    };
    // The ConstituentID field doesn't seem to be properly separated with "|"
    if (artistIds?.[i]) constituent.id = artistIds[i];
    else if (artistIds?.length === 1) constituent.id = artistIds[0];
    if (artistPrefixes?.[i]) constituent.prefix = artistPrefixes[i];
    if (artistSuffixes?.[i]) constituent.suffix = artistSuffixes[i];

    if (artistBeginDates?.[i])
      constituent.birthYear = parseInt(artistBeginDates[i]);
    if (artistEndDates?.[i])
      constituent.deathYear = parseInt(artistEndDates[i]);
    if (artistBios?.[i]) {
      constituent.dates = artistBios[i];
    } else {
      if (constituent.birthYear && constituent.deathYear)
        constituent.dates = `${constituent.birthYear}–${constituent.deathYear}`;
      else if (constituent.birthYear)
        constituent.dates = `${constituent.birthYear}–`;
    }

    if (artistNationalities?.[i])
      constituent.nationality = [artistNationalities[i]];
    if (artistGenders?.[i]) constituent.gender = artistGenders[i];
    if (artistRoles?.[i]) constituent.role = artistRoles[i];

    if (artistULANURLs?.[i]) {
      // Example URL:  http://vocab.getty.edu/page/ulan/500077295
      const ulanId = artistULANURLs[i].split('/').pop();
      if (ulanId) {
        const ulanArtist = await searchUlanArtistById(ulanId);
        if (ulanArtist?.preferredTerm) {
          constituent.canonicalName = ulanArtist.preferredTerm;
          constituent.ulan = ulanArtist;
        }
      }
    }
    constituents.push(constituent);
  }
  return constituents;
}

function getGeographicalLocations(
  doc: MetDocument
): DocumentGeographicalLocation[] | undefined {
  const geoType = doc['Geography Type'] || undefined;
  const geoCity = doc['City'] || undefined;
  const geoCounty = doc['County'] || undefined;
  const geoCountry = doc['Country'] || undefined;
  const geoRegion = doc['Region'] || undefined;
  const geoSubregion = doc['Subregion'] || undefined;
  const geoLocale = doc['Locale'] || undefined;
  const geoLocus = doc['Locus'] || undefined;
  const geoExcavation = doc['Excavation'] || undefined;
  const geoRiver = doc['River'] || undefined;

  let geoContinent: string | undefined = undefined;
  if (geoCountry) {
    const country = countryByContinent.find((c) => c.country === geoCountry);
    if (country) geoContinent = country.continent;
  }

  const geoParts: string[] = [];
  if (geoCity) geoParts.push(geoCity);
  if (geoCounty) geoParts.push(geoCounty);
  if (geoCountry) geoParts.push(geoCountry);
  if (geoRegion) geoParts.push(geoRegion);
  if (geoSubregion) geoParts.push(geoSubregion);
  if (geoLocale) geoParts.push(geoLocale);
  if (geoLocus) geoParts.push(geoLocus);
  if (geoExcavation) geoParts.push(geoExcavation);
  if (geoRiver) geoParts.push(geoRiver);
  const geoName = geoParts.join(', ');

  if (geoName) {
    return [
      {
        name: geoName,
        continent: geoContinent,
        country: geoCountry,
        type: geoType,
      } as DocumentGeographicalLocation,
    ];
  }
}

function getUrl(doc: MetDocument): string {
  return `https://www.metmuseum.org/art/collection/search/${getStringValue(
    doc['Object ID']
  )}`;
}

async function getImage(doc: MetDocument): Promise<DocumentImage | undefined> {
  if (!getBooleanValue(doc['Is Public Domain']) || !doc['Object ID']) return;

  const url = getUrl(doc);

  try {
    const response = await axios.get(url);
    const html = response.data;

    const $ = load(html);
    const ogImage = $('meta[property="og:image"]').attr('content');
    if (ogImage) {
      await snooze(1); // be nice
      return {
        id: getStringValue(doc['Object ID']),
        url: ogImage,
        thumbnailUrl: ogImage,
        rank: 0,
      } as DocumentImage;
    }
  } catch (error) {
    console.error(`Failed to fetch OG image for URL: ${url}`, error);
  }
}

async function transformDoc(doc: MetDocument): Promise<ArtworkDocument> {
  const esDoc: ArtworkDocument = {
    type: DOC_TYPE,
    source: SOURCE_NAME,
    sourceId: SOURCE_ID,
    id: getStringValue(doc['Object ID']),
    url: getUrl(doc),
    title: doc['Title'] || undefined,
    keywords: getKeywords(doc),
    creditLine: doc['Credit Line'] || undefined,
    classification: doc['Classification'] || undefined,
    departments: [doc['Department']] || undefined,
    dimensions: doc['Dimensions'] || undefined,
    period: doc['Period'] || undefined,
    dynasty: doc['Dynasty'] || undefined,
    portfolio: doc['Portfolio'] || undefined,
    rightsType: doc['Rights and Reproduction'] || undefined,
    publicAccess: doc['Is Public Domain']?.toLowerCase() === 'true',
    highlight: doc['Is Highlight']?.toLowerCase() === 'true',
    formattedDate: doc['Object Date'] || undefined,
    startYear: parseInt(doc['Object Begin Date'], 10) || undefined,
    endYear: parseInt(doc['Object End Date'], 10) || undefined,
  };

  if (doc['Object Number']) {
    esDoc.accessionNumber = doc['Object Number'];
    esDoc.searchText = doc['Object Number'];
  }

  if (doc['AccessionYear']) {
    esDoc.accessionDate = new Date(
      `${doc['AccessionYear']}-01-01`
    ).toISOString();
  }

  if (doc['Medium']) {
    esDoc.formattedMedium = doc['Medium'];
    // Assuming the same parseSignificantWords function
    esDoc.medium = parseSignificantWords(doc['Medium']);
  }

  esDoc.constituents = await getConstituents(doc);
  if (esDoc.constituents?.length)
    esDoc.primaryConstituent = esDoc.constituents[0];

  esDoc.geographicalLocations = getGeographicalLocations(doc);
  if (esDoc.geographicalLocations?.length)
    esDoc.primaryGeographicalLocation = esDoc.geographicalLocations[0];

  esDoc.image = await getImage(doc);

  return esDoc;
}

export const ingester: ElasticsearchIngester = {
  indexName: INDEX_NAME,
  dataFilename: DATA_FILE,
  sourceId: SOURCE_ID,
  sourceName: SOURCE_NAME,
  generateId: (doc: ArtworkDocument, includeSourcePrefix: boolean) => {
    return sourceAwareIdFormatter(doc.id, SOURCE_ID, includeSourcePrefix);
  },
  transform: async (doc) => {
    return transformDoc(doc);
  },
  extractTerms: async (doc: ArtworkDocument) => {
    return artworkTermsExtractor(doc, SOURCE_NAME);
  },
};
