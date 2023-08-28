import { getDictionary } from '@/dictionaries/dictionaries';
import { indicesMeta } from '@/util/elasticsearch/indicesMeta';

import { SearchAgg } from '@/components/search/search-agg';
import { ColorPicker } from './color-picker';
import { DateFilter } from './date-filter';

interface SearchFiltersProps {
  index: string;
  params: any;
  options: any;
  filters: any;
}

export function SearchFilters({
  index,
  params,
  options,
  filters,
}: SearchFiltersProps) {
  const dict = getDictionary();

  return (
    <>
      {index === 'art' && (
        <div className="color-picker mb-2">
          <ColorPicker params={params} />
        </div>
      )}
      {index === 'art' && <DateFilter params={params} />}
      {indicesMeta?.[index]?.aggs?.map(
        (aggName, i) =>
          aggName &&
          options[aggName]?.length > 0 && (
            <SearchAgg
              index={index}
              params={params}
              key={i}
              aggDisplayName={dict[`agg.${aggName}`]}
              aggName={aggName}
              options={options[aggName]}
              filters={filters}
              isDefaultOpen={indicesMeta[index].aggs.length === 1}
            />
          )
      )}
    </>
  );
}
