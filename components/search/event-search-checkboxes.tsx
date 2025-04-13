import { getDictionary } from '@/dictionaries/dictionaries';

import type { SearchParams } from '@/lib/elasticsearch/search/searchParams';
import { SearchCheckbox } from './search-checkbox';

interface EventSearchCheckboxesProps {
  params?: SearchParams;
}

export function EventSearchCheckboxes({ params }: EventSearchCheckboxesProps) {
  const dict = getDictionary();

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2">
      <div className="flex items-center space-x-2">
        <SearchCheckbox
          params={params}
          name="isNow"
          value={params?.isNow || false}
          label={dict['search.isNow']}
        />
      </div>
    </div>
  );
}
