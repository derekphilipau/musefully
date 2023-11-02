import { getDictionary } from '@/dictionaries/dictionaries';

import type { SearchParams } from '@/lib/elasticsearch/search/searchParams';
import { SearchCheckbox } from './search-checkbox';

interface ArtSearchCheckboxesProps {
  params?: SearchParams;
}

export function ArtSearchCheckboxes({ params }: ArtSearchCheckboxesProps) {
  const dict = getDictionary();

  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2">
      <div className="flex items-center space-x-2">
        <SearchCheckbox
          params={params}
          name="hasPhoto"
          value={params?.hasPhoto || false}
          label={dict['search.hasPhoto']}
        />
      </div>
      <div className="flex items-center space-x-2">
        <SearchCheckbox
          params={params}
          name="onView"
          value={params?.onView || false}
          label={dict['search.onView']}
        />
      </div>
      <div className="flex items-center space-x-2">
        <SearchCheckbox
          params={params}
          name="isUnrestricted"
          value={params?.isUnrestricted || false}
          label={dict['search.openAccess']}
        />
      </div>
    </div>
  );
}
