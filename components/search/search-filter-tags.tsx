import { memo, useMemo } from 'react';

import type { SearchParams } from '@/lib/elasticsearch/search/searchParams';
import { SearchFilterTag } from './search-filter-tag';

interface SearchFilterTagsProps {
  searchParams: SearchParams;
}

function SearchFilterTagsComponent({
  searchParams: params,
}: SearchFilterTagsProps) {
  const filterArr = useMemo(() => {
    return params ? Object.entries(params.aggFilters) : [];
  }, [params]);

  if (!(filterArr.length > 0) && !params.hexColor) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 pt-2">
      {filterArr.length > 0 &&
        filterArr.map(
          (filter, i) =>
            filter && (
              <SearchFilterTag
                key={i}
                params={params}
                name={filter[0]}
                value={filter[1]}
              />
            )
        )}
      {params.hexColor && (
        <SearchFilterTag params={params} name="color" value={params.hexColor} />
      )}
    </div>
  );
}

export const SearchFilterTags = memo(SearchFilterTagsComponent);
