import * as T from '@elastic/elasticsearch/lib/api/types';

import type { AggOption } from '@/types/aggregation';
import { getClient } from '../client';

const OPTIONS_PAGE_SIZE = 20; // 20 results per aggregation options search

interface OptionsParams {
  index: string | string[]; // Indices to search
  field: string; // Field to get options for
  q?: string | null; // Query string
}

/**
 * Get options/buckets for a specific field/agg
 * @param params
 * @param size Number of options to return
 * @returns
 */
export async function options(
  params: OptionsParams,
  size = OPTIONS_PAGE_SIZE
): Promise<AggOption[]> {
  const { index, field, q } = params;

  const request: T.SearchRequest = {
    index,
    size: 0,
    aggs: {
      [field]: {
        terms: {
          field,
          size,
        },
      },
    },
  };

  if (q) {
    request.query = {
      match: {
        [`${field}.search`]: {
          query: q,
          fuzziness: 'AUTO:3,7',
        },
      },
    };
  }

  const client = getClient();

  try {
    const response: T.SearchTemplateResponse = await client.search(request);
    if (response.aggregations?.[field] !== undefined) {
      const aggAgg: T.AggregationsAggregate = response.aggregations?.[field];
      if ('buckets' in aggAgg && aggAgg?.buckets) return aggAgg.buckets;
    }
  } catch (e) {
    console.error(e);
  }
  return [];
}
