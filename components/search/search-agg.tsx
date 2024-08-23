'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getDictionary } from '@/dictionaries/dictionaries';
import { ChevronsUpDown, Plus, X } from 'lucide-react';

import type { AggOption } from '@/types/aggregation';
import { useDebounce } from '@/lib/debounce';
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

export function SearchAgg({
  index,
  searchParams,
  aggDisplayName,
  aggName,
  options,
  isDefaultOpen = false,
}: SearchAggProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState('');
  const [checkedKeys, setCheckedKeys] = useState<string[]>([]);
  const [searchOptions, setSearchOptions] = useState<AggOption[]>([]);
  const [isOpen, setIsOpen] = useState(isDefaultOpen);

  const dict = getDictionary();

  function checkboxChange(key: string, checked: string | boolean) {
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
      router.push(`${pathname}?${updatedParams}`);
    }
  }

  function isChecked(key: string) {
    return checkedKeys.includes(key);
  }

  useEffect(() => {
    if (!isDefaultOpen) setIsOpen(false);
    const c: string[] = [];
    if (searchParams.aggFilters?.[aggName]) {
      c.push(searchParams.aggFilters[aggName]);
    }
    setCheckedKeys(c);
    if (c.length > 0) setIsOpen(true);
  }, [aggName, searchParams.aggFilters, isDefaultOpen]);

  const debouncedRequest = useDebounce(() => {
    if (aggName) {
      let url = `/api/search/options?index=${index}&field=${aggName}`;
      if (value) {
        url += `&q=${value}`;
      }
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          if (data?.length > 0) setSearchOptions(data);
          else setSearchOptions([]);
        });
    }
  });

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    debouncedRequest();
  };

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
          aria-label={dict['button.expandFilter']}
        >
          <h4 className="text-sm font-semibold">{aggDisplayName}</h4>
          <div>
            <ChevronsUpDown className="size-4" />
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
