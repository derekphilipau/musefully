import * as fs from 'fs';
import csv from 'csv-parser';

import type { DocumentConstituent } from '@/types/baseDocument';
import type { CollectionObjectDocument } from '@/types/collectionObjectDocument';
import type { ElasticsearchIngester} from '@/types/elasticsearchTransformer';
import {
  getStringValue,
  parseSignificantWords,
  sourceAwareIdFormatter,
} from '../ingestUtil';
import { searchUlanArtists } from '../../transform/ulan/searchUlanArtists';
import { collectionsTermsExtractor } from '../../transform/util/collectionsTermsExtractor';
import type { WhitneyArtist, WhitneyDocument } from './types';

const WHITNEY_ARTISTS: WhitneyArtist[] = [];
let WHITNEY_ARTISTS_LOADED = false;

const DATA_FILE = './data/whitney/artworks.csv';
const INDEX_NAME = 'collections';
const SOURCE_ID = 'whitney';
const SOURCE_NAME = 'The Whitney';
const OBJECT_TYPE = 'object';

/**
 * Whitney publishes artist data in a separate CSV file.
 * This function loads that data into memory.
 * @returns
 */
const loadArtistsData = async () => {
  return new Promise<void>((resolve, reject) => {
    fs.createReadStream('./data/whitney/artists.csv')
      .pipe(csv())
      .on('data', (row: WhitneyArtist) => {
        WHITNEY_ARTISTS.push(row);
      })
      .on('end', () => {
        WHITNEY_ARTISTS_LOADED = true;
        console.log('Loaded Whitney artists data');
        resolve();
      })
      .on('error', (err) => {
        reject(err);
      });
  });
};

function getConstituents(doc: WhitneyDocument): DocumentConstituent[] {
  // Split by comma and trim whitespace:
  const artistIds = doc.artist_ids?.split(',').map((id) => id.trim());
  const artistNames = doc.artists?.split(',').map((name) => name.trim());
  if (!artistNames?.length || artistNames.length !== artistIds.length)
    return [];
  const constituents: DocumentConstituent[] = [];
  for (let i = 0; i < artistNames?.length; i++) {
    const constituent: DocumentConstituent = {
      id: artistIds?.[i] || undefined,
      name: artistNames[i],
      canonicalName: artistNames[i],
    };
    const artistInfo = WHITNEY_ARTISTS.find(
      (artist) => artist.id === parseInt(artistIds?.[i])
    );
    if (artistInfo) {
      constituent.birthYear = artistInfo.birth_date;
      constituent.deathYear = artistInfo.death_date;
    }
    constituents.push(constituent);
  }
  return constituents;
}

async function transformDoc(doc: any): Promise<CollectionObjectDocument> {
  if (!WHITNEY_ARTISTS_LOADED) await loadArtistsData();

  const esDoc: CollectionObjectDocument = {
    // BaseDocument fields
    type: OBJECT_TYPE,
    source: SOURCE_NAME,
    sourceId: SOURCE_ID,
    id: getStringValue(doc.id),
    url: `https://whitney.org/collection/works/${getStringValue(doc.id)}`,
    title: doc.title || undefined,
  };

  if (doc.accession_number) {
    esDoc.accessionNumber = doc.accession_number;
    esDoc.searchText = doc.accession_number;
  }

  // Assuming that 'display_date' format is consistent
  // e.g. "c. 1926–1927", "1915–1918, posthumous print", "1972–1973, printed 1977", "1973, printed 1977"
  if (doc.display_date) {
    esDoc.formattedDate = doc.display_date;
    const years = doc.display_date.match(/\d{4}/g);
    if (years && years.length > 0) {
      esDoc.startYear = parseInt(years[0]);
      if (years.length > 1) {
        esDoc.endYear = parseInt(years[1]);
      } else {
        esDoc.endYear = esDoc.startYear;
      }
    }
  }

  if (doc.credit_line) esDoc.creditLine = doc.credit_line;
  if (doc.credit_line_repro) esDoc.copyright = doc.credit_line_repro; // TODO
  if (doc.classification) esDoc.classification = doc.classification;
  if (doc.dimensions) esDoc.dimensions = doc.dimensions;

  if (doc.medium) {
    esDoc.formattedMedium = doc.medium;
    esDoc.medium = parseSignificantWords(doc.medium);
  }

  const constituents = getConstituents(doc);
  if (constituents.length) {
    esDoc.constituents = constituents;
    // Assume first constituent is primary
    const ulanArtist = await searchUlanArtists(
      esDoc.constituents[0].name,
      esDoc.constituents[0].birthYear,
      esDoc.constituents[0].deathYear
    );
    if (ulanArtist?.preferredTerm) {
      esDoc.constituents[0].canonicalName = ulanArtist.preferredTerm;
      esDoc.constituents[0].ulan = ulanArtist;
    }
    esDoc.primaryConstituent = constituents[0];
  }

  return esDoc;
}

export const transformer: ElasticsearchIngester= {
  indexName: INDEX_NAME,
  dataFilename: DATA_FILE,
  sourceId: SOURCE_ID,
  sourceName: SOURCE_NAME,
  idGenerator: (
    doc: CollectionObjectDocument,
    includeSourcePrefix: boolean
  ) => {
    return sourceAwareIdFormatter(doc.id, SOURCE_ID, includeSourcePrefix);
  },
  transformer: async (doc) => {
    return transformDoc(doc);
  },
  termsExtractor: async (doc: CollectionObjectDocument) => {
    return collectionsTermsExtractor(doc, SOURCE_NAME);
  },
};
