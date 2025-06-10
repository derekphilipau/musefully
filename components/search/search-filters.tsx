'use client';

import { memo } from 'react';
import { useSearch } from '@/contexts/search-context';
import { getDictionary } from '@/dictionaries/dictionaries';

import { indicesMeta } from '@/lib/elasticsearch/indicesMeta';
import { SearchAgg } from '@/components/search/search-agg';
import { ColorPicker } from './color-picker';
import { DateFilter } from './date-filter';

interface SearchFiltersProps {}

function SearchFiltersComponent({}: SearchFiltersProps) {
  const { searchParams, options } = useSearch();
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
