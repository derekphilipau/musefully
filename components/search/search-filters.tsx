import { memo } from 'react';
import { getDictionary } from '@/dictionaries/dictionaries';

import type { AggOptions } from '@/types/aggregation';
import { indicesMeta } from '@/lib/elasticsearch/indicesMeta';
import type { SearchParams } from '@/lib/elasticsearch/search/searchParams';
import { SearchAgg } from '@/components/search/search-agg';
import { ColorPicker } from './color-picker';
import { DateFilter } from './date-filter';

interface SearchFiltersProps {
  searchParams: SearchParams;
  options: AggOptions;
}

function SearchFiltersComponent({ searchParams, options }: SearchFiltersProps) {
  const dict = getDictionary();

  return (
    <>
      {searchParams.index === 'art' && (
        <div className="color-picker mb-2">
          <ColorPicker searchParams={searchParams} />
        </div>
      )}
      {searchParams.index === 'art' && (
        <DateFilter searchParams={searchParams} />
      )}
      {indicesMeta?.[searchParams.index]?.aggs?.map(
        (aggName, i) =>
          aggName &&
          options[aggName]?.length > 0 && (
            <SearchAgg
              index={searchParams.index}
              searchParams={searchParams}
              key={i}
              aggDisplayName={dict[`field.${aggName}`]}
              aggName={aggName}
              options={options[aggName]}
              isDefaultOpen={indicesMeta[searchParams.index].aggs.length === 1}
            />
          )
      )}
    </>
  );
}

export const SearchFilters = memo(SearchFiltersComponent);
