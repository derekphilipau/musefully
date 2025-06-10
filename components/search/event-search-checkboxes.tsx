import { useSearch } from '@/contexts/search-context';
import { getDictionary } from '@/dictionaries/dictionaries';

import { SearchCheckbox } from './search-checkbox';

interface EventSearchCheckboxesProps {}

export function EventSearchCheckboxes({}: EventSearchCheckboxesProps) {
  const { searchParams: params } = useSearch();
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
