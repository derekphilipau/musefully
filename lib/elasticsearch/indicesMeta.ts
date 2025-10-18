/**
 * Metadata for each index.
 */

/**
 * The metadata for each index.
 *
 * @property [index] - The name of the index.
 * @property [index].aggs - The aggregations that are available for this index.
 */
interface IndicesMeta {
  [index: string]: {
    aggs: string[];
    filters: string[];
  };
}

/**
 * The metadata for each index.
 *
 * @property art - The metadata for the art index.
 * @property news - The metadata for the news index.
 */
export const indicesMeta: IndicesMeta = {
  art: {
    aggs: [
      'sourceId',
      'primaryConstituent.canonicalName',
      'classification',
      'medium',
      'departments',
      'period',
      'dynasty',
      'primaryGeographicalLocation.continent',
      'primaryGeographicalLocation.country',
      'primaryGeographicalLocation.name',
      'exhibitions',
      'section',
    ],
    filters: [
      // not all aggs need to be filters
      'sourceId',
      'primaryConstituent.canonicalName',
      'classification',
      'medium',
      'departments',
      'period',
      'dynasty',
      'primaryGeographicalLocation.continent',
      'primaryGeographicalLocation.country',
      'primaryGeographicalLocation.name',
      'exhibitions',
      'section',
      // non-agg filters:
      'isUnrestricted',
      'hasPhoto',
      'onView',
    ],
  },
  news: {
    aggs: ['sourceId'],
    filters: ['sourceId'],
  },
  events: {
    aggs: ['sourceId', 'location'],
    filters: ['sourceId', 'location'],
  },
  all: {
    aggs: ['sourceId'],
    filters: ['sourceId'],
  },
};
