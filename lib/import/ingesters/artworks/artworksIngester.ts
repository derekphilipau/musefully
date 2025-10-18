import type {
  ArtworkDocument,
  DocumentConstituent,
  DocumentGeographicalLocation,
  DocumentImage,
  DocumentImageDominantColor,
  DocumentMeasurements,
} from '@/types/document';
import type { ElasticsearchIngester } from '@/types/elasticsearchIngester';
import { sources } from '@/config/sources';
import { artworkTermsExtractor } from '../artworkTermsExtractor';
import { parseSignificantWords, sourceAwareIdFormatter } from '../ingestUtil';

const DATA_FILE = './data';
const INDEX_NAME = 'art';
const DEFAULT_TYPE = 'artwork';
const FALLBACK_SOURCE_ID = 'artworks';

type UnknownRecord = Record<string, unknown>;

interface UniversalRights {
  status?: string;
  openAccess?: boolean;
}

interface UniversalImageColor {
  hex?: string;
  percent?: number;
  lab?: {
    l?: number;
    a?: number;
    b?: number;
    L?: number;
    A?: number;
    B?: number;
  };
}

interface UniversalImage {
  id?: string;
  url?: string;
  thumbnailUrl?: string;
  filename?: string;
  thumbnailFilename?: string;
  alt?: string;
  rank?: number;
  dominantColors?: UniversalImageColor[];
}

interface UniversalConstituent extends UnknownRecord {
  id?: string;
  name?: string;
  canonicalName?: string;
  prefix?: string;
  suffix?: string;
  role?: string;
  roleType?: string;
  agentType?: string;
  biography?: string;
  dates?: string;
  birthYear?: number | string;
  deathYear?: number | string;
  nationality?: string[] | string;
  gender?: string;
  rank?: number | string;
  source?: string;
  sourceId?: string;
  wikiQid?: string;
  ulanId?: string;
  ulanUrl?: string;
}

interface UniversalArtwork extends UnknownRecord {
  kind?: string;
  source?: string;
  sourceName?: string;
  sourceId?: string;
  id?: string;
  uri?: string;
  title?: string;
  description?: string;
  classification?: string[] | string;
  formattedClassification?: string;
  classificationHierarchy?: string[] | string;
  genres?: string[] | string;
  medium?: string[] | string;
  formattedMedium?: string;
  materials?: string[] | string;
  techniques?: string[] | string;
  materialsAndTechniquesNote?: string;
  dimensions?: string;
  measurements?: UnknownRecord;
  creditLine?: string;
  culture?: string[] | string;
  period?: string;
  dynasty?: string;
  provenance?: string;
  departments?: string[] | string;
  collections?: unknown;
  formattedDate?: string;
  startYear?: number | string;
  endYear?: number | string;
  rights?: UniversalRights;
  publicAccess?: boolean | number | string;
  openAccess?: boolean | number | string;
  copyrightRestricted?: boolean | number | string;
  hasImage?: boolean | number | string;
  highlight?: boolean | number | string;
  onView?: boolean | number | string;
  section?: string;
  rightsType?: string;
  labels?: unknown;
  exhibitions?: string[] | string;
  productionPlaces?: string[] | string;
  geographicalLocations?: unknown;
  primaryGeographicalLocation?: unknown;
  spatialCoverage?: unknown;
  subjects?: unknown;
  sameAs?: string[] | string;
  keywords?: string[] | string;
  alternateTitles?: unknown;
  accessionNumber?: string;
  accessionDate?: string | number;
  objectNumber?: string;
  image?: UniversalImage;
  constituents?: UniversalConstituent[];
  primaryConstituent?: UniversalConstituent;
  raw?: UnknownRecord;
  derived?: UnknownRecord;
  ingestMetadata?: UnknownRecord;
}

function toStringValue(value: unknown): string | undefined {
  if (value == null) return undefined;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }
  if (typeof value === 'number' || typeof value === 'bigint') {
    return `${value}`;
  }
  return undefined;
}

function toBoolean(value: unknown): boolean | undefined {
  if (value == null) return undefined;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return undefined;
    if (['true', 't', 'yes', 'y', '1'].includes(normalized)) return true;
    if (['false', 'f', 'no', 'n', '0'].includes(normalized)) return false;
  }
  return undefined;
}

function parseYear(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.trunc(value);
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const num = Number.parseInt(trimmed, 10);
    if (Number.isFinite(num)) return num;
  }
  return undefined;
}

function normalizeStringArray(
  value: unknown
): string[] | undefined {
  if (value == null) return undefined;
  const arr = Array.isArray(value) ? value : [value];
  const result = arr
    .map(toStringValue)
    .filter((entry): entry is string => !!entry);

  if (result.length === 0) return undefined;
  return Array.from(new Set(result));
}

function normalizeFromObjects(
  value: unknown,
  keys: string[]
): string[] | undefined {
  if (value == null) return undefined;
  const items = Array.isArray(value) ? value : [value];
  const result: string[] = [];

  for (const item of items) {
    if (typeof item === 'string') {
      const normalized = toStringValue(item);
      if (normalized) result.push(normalized);
      continue;
    }

    if (item && typeof item === 'object') {
      for (const key of keys) {
        const normalized = toStringValue(
          (item as Record<string, unknown>)[key]
        );
        if (normalized) {
          result.push(normalized);
          break;
        }
      }
    }
  }

  if (result.length === 0) return undefined;
  return Array.from(new Set(result));
}

function parseMeasurements(
  value: unknown
): DocumentMeasurements | undefined {
  if (!value || typeof value !== 'object') return undefined;
  const measurement: DocumentMeasurements = {};
  const keys: (keyof DocumentMeasurements)[] = [
    'height',
    'width',
    'depth',
    'area',
    'volume',
  ];

  for (const key of keys) {
    const rawVal = (value as Record<string, unknown>)[key];
    if (rawVal == null) continue;
    let numeric: number | undefined;
    if (typeof rawVal === 'number') numeric = rawVal;
    else if (typeof rawVal === 'string') {
      const parsed = Number.parseFloat(rawVal);
      if (Number.isFinite(parsed)) numeric = parsed;
    }
    if (numeric !== undefined) {
      measurement[key] = numeric;
    }
  }

  return Object.keys(measurement).length > 0 ? measurement : undefined;
}

function extractDominantColors(
  rawColors: UniversalImageColor[] | undefined
): DocumentImageDominantColor[] | undefined {
  if (!Array.isArray(rawColors)) return undefined;
  const colors: DocumentImageDominantColor[] = [];

  for (const color of rawColors) {
    if (!color) continue;
    const hex = toStringValue(color.hex);
    const lab = color.lab || {};
    const l =
      typeof lab.l === 'number'
        ? lab.l
        : typeof lab.L === 'number'
        ? lab.L
        : undefined;
    const a =
      typeof lab.a === 'number'
        ? lab.a
        : typeof lab.A === 'number'
        ? lab.A
        : undefined;
    const b =
      typeof lab.b === 'number'
        ? lab.b
        : typeof lab.B === 'number'
        ? lab.B
        : undefined;

    let percent: number | undefined;
    if (typeof color.percent === 'number') {
      percent = Math.round(color.percent * 100);
    }

    if (hex && percent !== undefined && l !== undefined && a !== undefined && b !== undefined) {
      colors.push({ hex, percent, l, a, b });
    }
  }

  return colors.length ? colors : undefined;
}

function buildCdnImageUrl(
  sourceSlug: string,
  filename: string | undefined,
  variant: 'main' | 'thumb'
): string | undefined {
  const base = process.env.MUSEFULLY_IMAGE_CDN_BASE_URL;
  if (!base) return undefined;
  const cleanFilename = filename?.replace(/^\/+/, '');
  if (!cleanFilename) return undefined;
  const cleanSource = sourceSlug?.trim();
  if (!cleanSource) return undefined;
  const normalizedBase = base.replace(/\/$/, '');
  const segment = variant === 'thumb' ? 'thumb' : 'main';
  return `${normalizedBase}/${cleanSource}/${segment}/${cleanFilename}`;
}

function extractImage(
  doc: UniversalArtwork,
  sourceSlug: string
): DocumentImage | undefined {
  const imageData = doc.image;
  const rawData = doc.raw as UnknownRecord | undefined;
  const cdnMainUrl = buildCdnImageUrl(
    sourceSlug,
    toStringValue(imageData?.filename),
    'main'
  );

  const fallbackMainUrl =
    toStringValue(imageData?.url) ||
    toStringValue(rawData?.manifest && (rawData.manifest as UnknownRecord)?.thumb);
  const url = cdnMainUrl || fallbackMainUrl;
  if (!url) return undefined;

  const cdnThumbUrl = buildCdnImageUrl(
    sourceSlug,
    toStringValue(imageData?.thumbnailFilename) ||
      toStringValue(imageData?.filename),
    'thumb'
  );

  const thumbnailUrl =
    cdnThumbUrl ||
    toStringValue(imageData?.thumbnailUrl) ||
    toStringValue(rawData?.manifest && (rawData.manifest as UnknownRecord)?.thumb) ||
    url;

  const dominantColors = extractDominantColors(imageData?.dominantColors);

  const image: DocumentImage = {
    id:
      toStringValue(imageData?.id) ||
      toStringValue(imageData?.filename),
    url,
    thumbnailUrl,
    alt: toStringValue(imageData?.alt),
    rank:
      typeof imageData?.rank === 'number' ? imageData.rank : undefined,
  };

  if (dominantColors?.length) {
    image.dominantColors = dominantColors;
  }

  return image;
}

function extractConstituent(
  raw: UniversalConstituent | undefined
): DocumentConstituent | undefined {
  if (!raw?.name) return undefined;

  const nationality = normalizeStringArray(raw.nationality);
  const rank =
    typeof raw.rank === 'number'
      ? raw.rank
      : typeof raw.rank === 'string'
      ? Number.parseInt(raw.rank, 10)
      : undefined;

  const constituent: DocumentConstituent = {
    id: toStringValue(raw.id),
    name: raw.name,
    canonicalName: raw.canonicalName || raw.name,
    prefix: toStringValue(raw.prefix),
    suffix: toStringValue(raw.suffix),
    role: toStringValue(raw.role),
    roleType: toStringValue(raw.roleType),
    agentType: toStringValue(raw.agentType),
    biography: toStringValue(raw.biography),
    dates: toStringValue(raw.dates),
    birthYear: parseYear(raw.birthYear),
    deathYear: parseYear(raw.deathYear),
    nationality,
    gender: toStringValue(raw.gender),
    rank: Number.isFinite(rank) ? rank : undefined,
    source: toStringValue(raw.source),
    sourceId: toStringValue(raw.sourceId),
    wikiQid: toStringValue(raw.wikiQid),
    ulanId: toStringValue(raw.ulanId),
    ulanUrl: toStringValue(raw.ulanUrl),
  };

  if (!constituent.dates && constituent.biography) {
    constituent.dates = constituent.biography;
  }

  return constituent;
}

function extractConstituents(
  raw: UniversalConstituent[] | undefined
): DocumentConstituent[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const parsed = raw
    .map(extractConstituent)
    .filter((entry): entry is DocumentConstituent => !!entry);

  if (!parsed.length) return undefined;

  parsed.sort((a, b) => {
    const rankA = a.rank ?? Number.POSITIVE_INFINITY;
    const rankB = b.rank ?? Number.POSITIVE_INFINITY;
    return rankA - rankB;
  });

  const seen = new Set<string>();
  const deduped: DocumentConstituent[] = [];
  for (const entry of parsed) {
    const key = `${entry.name}|${entry.role}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(entry);
  }

  return deduped.length ? deduped : undefined;
}

function normalizeGeographicalLocation(
  value: unknown
): DocumentGeographicalLocation | undefined {
  if (!value) return undefined;

  if (typeof value === 'string') {
    const name = toStringValue(value);
    return name ? { name } : undefined;
  }

  if (typeof value === 'object') {
    const record = value as UnknownRecord;
    const name =
      toStringValue(record.name) ||
      toStringValue(record.label) ||
      toStringValue(record.value);
    if (!name) return undefined;

    const location: DocumentGeographicalLocation = { name };
    const id = toStringValue(record.id);
    if (id) location.id = id;
    const continent = toStringValue(record.continent);
    if (continent) location.continent = continent;
    const country = toStringValue(record.country);
    if (country) location.country = country;
    const type =
      toStringValue(record.type) || toStringValue((record as UnknownRecord).kind);
    if (type) location.type = type;

    return location;
  }

  return undefined;
}

function extractGeographicalLocations(
  geographicalLocations: unknown,
  spatialCoverage: unknown,
  productionPlaces: string[] | undefined
): DocumentGeographicalLocation[] | undefined {
  const locations: DocumentGeographicalLocation[] = [];
  const seen = new Set<string>();

  const pushLocation = (location: DocumentGeographicalLocation) => {
    if (!location.name) return;
    const key = [
      location.name.toLowerCase(),
      location.country?.toLowerCase(),
      location.continent?.toLowerCase(),
    ]
      .filter(Boolean)
      .join('|');
    if (seen.has(key)) return;
    seen.add(key);
    locations.push(location);
  };

  const addLocation = (value: unknown) => {
    if (Array.isArray(value)) {
      for (const raw of value) {
        const normalized = normalizeGeographicalLocation(raw);
        if (normalized) pushLocation(normalized);
      }
      return;
    }

    const normalized = normalizeGeographicalLocation(value);
    if (normalized) pushLocation(normalized);
  };

  addLocation(geographicalLocations);

  if (Array.isArray(spatialCoverage)) {
    for (const raw of spatialCoverage) {
      const normalized = normalizeGeographicalLocation(raw);
      if (normalized) pushLocation(normalized);
    }
  }

  if (productionPlaces) {
    for (const place of productionPlaces) {
      pushLocation({ name: place });
    }
  }

  return locations.length ? locations : undefined;
}

function buildKeywords(groups: Array<string[] | undefined>): string[] | undefined {
  const set = new Set<string>();
  for (const group of groups) {
    if (!group) continue;
    for (const value of group) {
      const normalized = value.trim();
      if (normalized) set.add(normalized);
    }
  }
  return set.size ? Array.from(set) : undefined;
}

function buildSearchText(parts: Array<string[] | string | undefined>): string | undefined {
  const set = new Set<string>();

  const addString = (value?: string) => {
    const normalized = value && value.trim();
    if (normalized) set.add(normalized);
  };

  const addArray = (values?: string[]) => {
    values?.forEach(addString);
  };

  for (const part of parts) {
    if (Array.isArray(part)) addArray(part);
    else addString(toStringValue(part));
  }

  return set.size ? Array.from(set).join(' | ') : undefined;
}

function parseAccessionDate(value: unknown): string | undefined {
  if (value == null) return undefined;
  if (typeof value === 'number') {
    return new Date(value).toISOString();
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    if (/^\d{4}$/.test(trimmed)) {
      return new Date(`${trimmed}-01-01T00:00:00Z`).toISOString();
    }
    const parsed = new Date(trimmed);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }
  return undefined;
}

async function transformArtwork(
  doc: UniversalArtwork
): Promise<ArtworkDocument | undefined> {
  const sourceSlug = toStringValue(doc.source) || FALLBACK_SOURCE_ID;
  const sourceName =
    sources[sourceSlug]?.name || toStringValue(doc.sourceName) || sourceSlug;

  const objectId =
    toStringValue(doc.sourceId) ||
    (toStringValue(doc.id)?.startsWith(`${sourceSlug}_`)
      ? toStringValue(doc.id)?.slice(sourceSlug.length + 1)
      : toStringValue(doc.id));

  if (!objectId) {
    console.warn('Skipping document without sourceId/id', doc);
    return undefined;
  }

  const type = toStringValue(doc.kind) || DEFAULT_TYPE;
  const image = extractImage(doc, sourceSlug);
  const hasImage =
    toBoolean(doc.hasImage) ?? (image?.url ? true : undefined);

  const materials = normalizeStringArray(doc.materials);
  const techniques = normalizeStringArray(doc.techniques);
  const collections = normalizeFromObjects(doc.collections, [
    'name',
    'label',
    'value',
    'title',
  ]);
  const subjects = normalizeFromObjects(doc.subjects, [
    'label',
    'name',
    'value',
  ]);
  const alternateTitles = normalizeFromObjects(doc.alternateTitles, [
    'value',
    'title',
    'label',
  ]);
  const genres = normalizeStringArray(doc.genres);
  const classificationHierarchy = normalizeStringArray(
    doc.classificationHierarchy
  );
  const classification = normalizeStringArray(doc.classification);
  const formattedClassification =
    toStringValue(doc.formattedClassification) || classification?.[0];
  const cultures = normalizeStringArray(doc.culture);
  const departments = normalizeStringArray(doc.departments);
  const legacyProductionPlaces = normalizeStringArray(doc.productionPlaces);
  const sameAs = normalizeStringArray(doc.sameAs);
  const keywordsFromDoc = normalizeStringArray(doc.keywords);

  const mediumValues = normalizeStringArray(doc.medium);
  const formattedMedium =
    toStringValue(doc.formattedMedium) ||
    (mediumValues ? mediumValues.join('; ') : undefined);

  const mediumKeywordSet = new Set<string>();
  if (mediumValues) {
    for (const value of mediumValues) mediumKeywordSet.add(value);
  }
  for (const token of parseSignificantWords(formattedMedium)) {
    mediumKeywordSet.add(token);
  }
  if (materials) {
    for (const material of materials) mediumKeywordSet.add(material);
  }
  if (techniques) {
    for (const technique of techniques) mediumKeywordSet.add(technique);
  }
  const mediumKeywords = mediumKeywordSet.size
    ? Array.from(mediumKeywordSet)
    : undefined;

  const constituents = extractConstituents(doc.constituents);
  const primaryConstituent =
    extractConstituent(doc.primaryConstituent) ||
    (constituents ? constituents[0] : undefined);

  let mergedConstituents = constituents;
  if (primaryConstituent) {
    if (!mergedConstituents) mergedConstituents = [primaryConstituent];
    else {
      const existingIndex = mergedConstituents.findIndex(
        (entry) =>
          entry.name === primaryConstituent.name &&
          entry.role === primaryConstituent.role
      );
      if (existingIndex === -1) {
        mergedConstituents = [primaryConstituent, ...mergedConstituents];
      } else if (existingIndex > 0) {
        mergedConstituents = [
          primaryConstituent,
          ...mergedConstituents.filter((_, idx) => idx !== existingIndex),
        ];
      }
    }
  }

  const measurements = parseMeasurements(doc.measurements);

  const openAccess =
    toBoolean(doc.openAccess) ??
    (doc.rights ? toBoolean(doc.rights.openAccess) : undefined);

  const rightsType =
    toStringValue(doc.rightsType) || toStringValue(doc.rights?.status);

  let geographicalLocations = extractGeographicalLocations(
    doc.geographicalLocations,
    doc.spatialCoverage,
    legacyProductionPlaces
  );

  const primaryGeographicalLocationFromDoc = normalizeGeographicalLocation(
    doc.primaryGeographicalLocation
  );

  let primaryGeographicalLocation =
    primaryGeographicalLocationFromDoc ||
    (geographicalLocations ? geographicalLocations[0] : undefined);

  if (primaryGeographicalLocation) {
    geographicalLocations = geographicalLocations ?? [];
    const existingIndex = geographicalLocations.findIndex(
      (location) =>
        location.name.toLowerCase() ===
        primaryGeographicalLocation!.name.toLowerCase()
    );
    if (existingIndex === -1) {
      geographicalLocations = [
        primaryGeographicalLocation,
        ...geographicalLocations,
      ];
    } else if (existingIndex > 0) {
      geographicalLocations = [
        primaryGeographicalLocation,
        ...geographicalLocations.filter((_, idx) => idx !== existingIndex),
      ];
    } else {
      primaryGeographicalLocation = geographicalLocations[0];
    }
  }

  const geographicalLocationKeywords = geographicalLocations
    ?.map((location) => location.name)
    .filter((name): name is string => !!name);

  const keywords = buildKeywords([
    keywordsFromDoc,
    genres,
    subjects,
    collections,
    cultures,
    classification,
    classificationHierarchy,
    mediumKeywords,
    materials,
    techniques,
    geographicalLocationKeywords,
    legacyProductionPlaces,
  ]);

  const searchText = buildSearchText([
    doc.objectNumber,
    doc.accessionNumber,
    alternateTitles,
    subjects,
  ]);

  const accessionNumber =
    toStringValue(doc.accessionNumber) || toStringValue(doc.objectNumber);

  const accessionDate = parseAccessionDate(doc.accessionDate);

  const esDoc: ArtworkDocument = {
    type,
    source: sourceName,
    sourceId: sourceSlug,
    id: objectId,
    url: toStringValue(doc.uri),
    title: toStringValue(doc.title),
    description: toStringValue(doc.description),
    searchText,
    keywords,
    primaryConstituent,
    constituents: mergedConstituents,
    image,
    hasImage,
    classification: classification,
    formattedClassification: formattedClassification || undefined,
    classificationHierarchy,
    genres,
    alternateTitles,
    accessionNumber,
    accessionDate,
    creditLine: toStringValue(doc.creditLine),
    cultures,
    period: toStringValue(doc.period),
    dynasty: toStringValue(doc.dynasty),
    provenance: toStringValue(doc.provenance),
    medium:
      mediumValues ??
      (mediumKeywords && mediumKeywords.length ? mediumKeywords : undefined),
    formattedMedium: formattedMedium || undefined,
    materials,
    techniques,
    materialsAndTechniquesNote: toStringValue(doc.materialsAndTechniquesNote),
    dimensions: toStringValue(doc.dimensions),
    measurements,
    copyright: toStringValue(doc.copyright),
    publicAccess: toBoolean(doc.publicAccess),
    openAccess,
    copyrightRestricted: toBoolean(doc.copyrightRestricted),
    highlight: toBoolean(doc.highlight),
    section: toStringValue(doc.section),
    onView: toBoolean(doc.onView),
    rightsType,
    labels: doc.labels as string[] | undefined,
    departments,
    collections,
    exhibitions: normalizeStringArray(doc.exhibitions),
    primaryGeographicalLocation,
    geographicalLocations,
    subjects,
    sameAs,
    formattedDate: toStringValue(doc.formattedDate),
    startYear: parseYear(doc.startYear),
    endYear: parseYear(doc.endYear),
    raw: doc.raw,
    derived: doc.derived,
    ingestMetadata: doc.ingestMetadata,
  };

  return esDoc;
}

export const ingester: ElasticsearchIngester = {
  indexName: INDEX_NAME,
  dataFilename: DATA_FILE,
  sourceId: FALLBACK_SOURCE_ID,
  generateId: (doc, includeSourcePrefix = false) => {
    const sourceId = doc.sourceId || FALLBACK_SOURCE_ID;
    return sourceAwareIdFormatter(doc.id, sourceId, includeSourcePrefix);
  },
  transform: async (doc: UniversalArtwork) => transformArtwork(doc),
  extractTerms: async (doc: ArtworkDocument) => {
    const sourceName =
      sources[doc.sourceId || '']?.name || doc.source || FALLBACK_SOURCE_ID;
    return artworkTermsExtractor(doc, sourceName);
  },
};
