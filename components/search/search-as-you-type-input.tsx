'use client';

import {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { getDictionary } from '@/dictionaries/dictionaries';

import type { TermDocument } from '@/types/document';
import { useDebounce } from '@/lib/debounce';
import type { SearchParams } from '@/lib/elasticsearch/search/searchParams';
import { toURLSearchParams } from '@/lib/elasticsearch/search/searchParams';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Command, CommandGroup, CommandItem } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/components/ui/popover';

interface SearchAsYouTypeInputProps {
  params?: SearchParams;
}

function SearchAsYouTypeInputComponent({ params }: SearchAsYouTypeInputProps) {
  const dict = getDictionary();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(searchParams?.get('q') || '');
  const [searchOptions, setSearchOptions] = useState<TermDocument[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const debouncedSuggest = useDebounce(() => {
    if (value?.length < 3) {
      setSearchOptions([]);
      setOpen(false);
      return;
    }
    if (value)
      fetch(`/api/search/suggest?q=${value}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.data?.length > 0) {
            setSearchOptions(data.data);
            setOpen(true);
          } else {
            setSearchOptions([]);
            setOpen(false);
          }
        });
  }, 50);

  const searchForQuery = useCallback(
    (currentValue = '') => {
      const updatedParams = toURLSearchParams(params);
      if (currentValue) updatedParams.set('q', currentValue);
      else updatedParams.delete('q');
      updatedParams.delete('p');
      setSearchOptions([]);
      setOpen(false);
      setValue(currentValue);
      router.push(`${pathname}?${updatedParams}`);
    },
    [params, pathname, router]
  );

  const searchForTerm = useCallback(
    (term: TermDocument) => {
      const updatedParams = toURLSearchParams(params);
      if (!term.value || !term.field) return;
      if (term.field === 'primaryConstituent.canonicalName') {
        updatedParams.set('primaryConstituent.canonicalName', term.value);
      } else {
        updatedParams.set(term.field, term.value);
      }
      updatedParams.delete('q');
      updatedParams.delete('p');
      const searchPath = `/${term.index || ''}`;
      setSearchOptions([]);
      setOpen(false);
      setValue('');
      router.push(`${searchPath}?${updatedParams}`);
    },
    [params, router]
  );

  const onQueryChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.value);
      debouncedSuggest();
    },
    [debouncedSuggest]
  );

  const handleOnSubmit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      searchForQuery(value);
    },
    [searchForQuery, value]
  );

  const handleOpenChange = useCallback((event) => {
    if (event) event.preventDefault();
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (!open || searchOptions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < searchOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : searchOptions.length - 1
        );
        break;
      case 'Enter':
        if (selectedIndex >= 0 && selectedIndex < searchOptions.length) {
          e.preventDefault();
          searchForTerm(searchOptions[selectedIndex]);
        }
        break;
      case 'Escape':
        setOpen(false);
        setSelectedIndex(-1);
        break;
    }
  }, [open, searchOptions, selectedIndex, searchForTerm]);

  useEffect(() => {
    setSearchOptions([]);
    setOpen(false);
    setValue(searchParams?.get('q') || '');
    setSelectedIndex(-1);
  }, [pathname, searchParams]);

  const getFieldName = useCallback(
    (field: string) => {
      if (field === 'primaryConstituent')
        return dict['field.primaryConstituent.canonicalName'];
      else return dict[`field.${field}`];
    },
    [dict]
  );

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverAnchor asChild>
        <form onSubmit={handleOnSubmit}>
          <div className="flex rounded-md shadow-sm">
            <div className="relative flex grow items-stretch focus-within:z-10">
              <Input
                type="search"
                className="rounded-none rounded-l-md text-base sm:text-sm"
                name="query"
                placeholder={dict['search.search']}
                onChange={onQueryChange}
                value={value}
                autoComplete="off"
                onBlur={() => setOpen(false)}
                onKeyDown={handleKeyDown}
                aria-label={dict['search.search']}
                aria-expanded={open}
                aria-haspopup="listbox"
                aria-autocomplete="list"
                aria-activedescendant={selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined}
                role="combobox"
              />
            </div>
            <Button
              type="submit"
              variant="secondary"
              className="rounded-none rounded-r-md"
              aria-label={dict['search.search']}
            >
              <Icons.search className="size-5" />
            </Button>
          </div>
        </form>
      </PopoverAnchor>
      <PopoverContent
        className="p-0"
        onOpenAutoFocus={handleOpenChange}
        align="start"
        role="listbox"
        aria-label="Search suggestions"
      >
        <Command>
          <CommandGroup>
            {searchOptions.map((term, index) => (
              <CommandItem
                key={term.value}
                onSelect={() => {
                  searchForTerm(term);
                }}
                className={`cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700 ${
                  selectedIndex === index ? 'bg-neutral-100 dark:bg-neutral-700' : ''
                }`}
                role="option"
                aria-selected={selectedIndex === index}
                id={`suggestion-${index}`}
              >
                <div className="flex w-full items-center justify-between ">
                  <div className="ml-2">{term.value}</div>
                  <Badge variant="secondary">{getFieldName(term.field)}</Badge>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export const SearchAsYouTypeInput = memo(SearchAsYouTypeInputComponent);
