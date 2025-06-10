'use client';

import {
  ChangeEvent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getDictionary } from '@/dictionaries/dictionaries';
import { useNavigation } from '@/hooks/use-navigation';
import { useSearchFilterOptions } from '@/hooks/use-search-filter-options';
import { ChevronsUpDown, Plus, X } from 'lucide-react';

import type { AggOption } from '@/types/aggregation';
import {
  toURLSearchParams,
  type SearchParams,
} from '@/lib/elasticsearch/search/searchParams';
import { getBooleanValue } from '@/lib/various';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SearchAggProps {
  index: string;
  searchParams: SearchParams;
  aggDisplayName: string;
  aggName: string;
  options?: AggOption[];
  isDefaultOpen?: boolean;
}

function SearchAggComponent({
  index,
  searchParams,
  aggDisplayName,
  aggName,
  options,
  isDefaultOpen = false,
}: SearchAggProps) {
  const { navigateToSearch } = useNavigation({ scrollToTop: false });
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(isDefaultOpen);

  const {
    query: value,
    filterOptions: searchOptions,
    isLoading: optionsLoading,
    error: optionsError,
    updateQuery,
    clearOptions,
  } = useSearchFilterOptions({ index, field: aggName || '' });

  const dict = getDictionary();

  const checkboxChange = useCallback(
    (key: string, checked: string | boolean) => {
      const myChecked = getBooleanValue(checked);
      let option = options?.find((o) => o.key === key);
      if (searchOptions && !option)
        option = searchOptions?.find((o) => o.key === key);
      if (option) {
        if (!aggName) return;
        if (checked) {
          const c = checkedKeys;
          c.push(key);
          setCheckedKeys(c);
        } else {
          setCheckedKeys(checkedKeys.filter((e) => e !== key));
        }
        const updatedParams = toURLSearchParams(searchParams);
        if (myChecked) updatedParams.set(aggName, key);
        else updatedParams.delete(aggName || '');
        updatedParams.delete('p');
        navigateToSearch(updatedParams);
      }
    },
    [
      options,
      searchOptions,
      aggName,
      checkedKeys,
      searchParams,
      navigateToSearch,
    ]
  );

  const isChecked = useCallback(
    (key: string) => {
      return checkedKeys.includes(key);
    },
    [checkedKeys]
  );

  useEffect(() => {
    if (!isDefaultOpen) setIsOpen(false);
    const c: string[] = [];
    if (searchParams.aggFilters?.[aggName]) {
      c.push(searchParams.aggFilters[aggName]);
    }
    setCheckedKeys(c);
    if (c.length > 0) setIsOpen(true);
  }, [aggName, searchParams.aggFilters, isDefaultOpen]);

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      updateQuery(e.target.value);
    },
    [updateQuery]
  );

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full space-y-2"
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex w-full items-center justify-between p-1"
          aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${aggDisplayName} filter`}
          aria-expanded={isOpen}
        >
          <h4 className="text-sm font-semibold">{aggDisplayName}</h4>
          <div>
            <ChevronsUpDown className="size-4" aria-hidden="true" />
            <span className="sr-only">Toggle {aggDisplayName}</span>
          </div>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="w-full space-y-2">
        <div className="mb-2">
          <Input
            name="query"
            placeholder={`Search ${aggDisplayName}`}
            onChange={onChange}
            value={value}
            aria-label={`Search within ${aggDisplayName} options`}
          />
        </div>
        {searchOptions?.length > 0 &&
          searchOptions?.map(
            (option: AggOption, i) =>
              option && (
                <div
                  className="flex items-center space-x-2"
                  key={`agg-${aggName}-${i}`}
                >
                  <Checkbox
                    id={`terms-${aggName}-${i}`}
                    onCheckedChange={(checked) =>
                      checkboxChange(option.key, checked)
                    }
                    checked={isChecked(option.key)}
                    aria-labelledby={`terms-label-${aggName}-${i}`}
                  />
                  <Label
                    htmlFor={`terms-${aggName}-${i}`}
                    id={`terms-label-${aggName}-${i}`}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option.key}
                    <span className="text-muted-foreground">
                      {option.doc_count ? ` ${option.doc_count}` : ''}
                    </span>
                  </Label>
                </div>
              )
          )}
        {searchOptions?.length === 0 &&
          Array.isArray(options) &&
          options?.length > 0 &&
          options?.map(
            (option: AggOption, i) =>
              option && (
                <div
                  className="flex items-center space-x-2"
                  key={`agg-${aggName}-${i}`}
                >
                  <Checkbox
                    id={`terms-${aggName}-${i}`}
                    onCheckedChange={(checked) =>
                      checkboxChange(option.key, checked)
                    }
                    checked={isChecked(option.key)}
                    aria-labelledby={`terms-label-${aggName}-${i}`}
                  />
                  <Label
                    htmlFor={`terms-${aggName}-${i}`}
                    id={`terms-label-${aggName}-${i}`}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {option.key}
                    <span className="text-muted-foreground">
                      {option.doc_count ? ` ${option.doc_count}` : ''}
                    </span>
                  </Label>
                </div>
              )
          )}
      </CollapsibleContent>
    </Collapsible>
  );
}

export const SearchAgg = memo(SearchAggComponent);
