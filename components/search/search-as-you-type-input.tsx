'use client';

import {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  memo,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useSearch } from '@/contexts/search-context';
import { getDictionary } from '@/dictionaries/dictionaries';
import { useNavigation } from '@/hooks/use-navigation';
import { useSearchSuggestions } from '@/hooks/use-search-suggestions';

import type { TermDocument } from '@/types/document';
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

interface SearchAsYouTypeInputProps {}

function SearchAsYouTypeInputComponent({}: SearchAsYouTypeInputProps) {
  const { searchParams: params } = useSearch();
  const dict = getDictionary();
  const pathname = usePathname();
  const { navigateToSearch, navigate } = useNavigation({ scrollToTop: true });
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(searchParams?.get('q') || '');
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const {
    suggestions: searchOptions,
    isLoading: suggestionsLoading,
    error: suggestionsError,
    updateQuery,
    clearSuggestions,
  } = useSearchSuggestions({ minLength: 3, debounceMs: 50 });

  const searchForQuery = useCallback(
    (currentValue = '') => {
      const updatedParams = toURLSearchParams(params);
      if (currentValue) updatedParams.set('q', currentValue);
      else updatedParams.delete('q');
      updatedParams.delete('p');
      clearSuggestions();
      setOpen(false);
      setValue(currentValue);
      navigateToSearch(updatedParams);
    },
    [params, navigateToSearch, clearSuggestions]
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
      const searchPath = `/${term.index || ''}?${updatedParams}`;
      clearSuggestions();
      setOpen(false);
      setValue('');
      navigate(searchPath);
    },
    [params, navigate, clearSuggestions]
  );

  const onQueryChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);
      updateQuery(newValue);
    },
    [updateQuery]
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

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (!open || searchOptions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < searchOptions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) =>
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
    },
    [open, searchOptions, selectedIndex, searchForTerm]
  );

  useEffect(() => {
    clearSuggestions();
    setOpen(false);
    setValue(searchParams?.get('q') || '');
    setSelectedIndex(-1);
  }, [pathname, searchParams, clearSuggestions]);

  // Open/close suggestions based on data
  useEffect(() => {
    if (searchOptions.length > 0 && !suggestionsError) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [searchOptions, suggestionsError]);

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
                aria-activedescendant={
                  selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined
                }
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
                  selectedIndex === index
                    ? 'bg-neutral-100 dark:bg-neutral-700'
                    : ''
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
