'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { getDictionary } from '@/dictionaries/dictionaries';

import type { Term } from '@/types/term';
import { useDebounce } from '@/lib/debounce';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Command, CommandGroup, CommandItem } from '@/components/ui/command';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/components/ui/popover-local';

interface SearchAsYouTypeInputProps {
  params?: any;
}

export function SearchAsYouTypeInput({ params }: SearchAsYouTypeInputProps) {
  const dict = getDictionary();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(searchParams?.get('q') || '');
  const [searchOptions, setSearchOptions] = useState<Term[]>([]);

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

  function searchForQuery(currentValue = '') {
    const updatedParams = new URLSearchParams(params);
    if (currentValue) updatedParams.set('q', currentValue);
    else updatedParams.delete('q');
    updatedParams.delete('p');
    setSearchOptions([]);
    setOpen(false);
    setValue(currentValue);
    router.push(`${pathname}?${updatedParams}`);
  }

  function searchForTerm(term: Term) {
    const updatedParams = new URLSearchParams(params);
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
  }

  const onQueryChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    debouncedSuggest();
  };

  function handleOnSubmit(event: FormEvent) {
    event.preventDefault();
    searchForQuery(value);
  }

  function handleOpenChange(event) {
    if (event) event.preventDefault();
  }

  useEffect(() => {
    setSearchOptions([]);
    setOpen(false);
    setValue(searchParams?.get('q') || '');
  }, [pathname, searchParams]);

  function getFieldName(field: string) {
    if (field === 'primaryConstituent')
      return dict['field.primaryConstituent.canonicalName'];
    else return dict[`field.${field}`];
  }

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
              />
            </div>
            <Button
              type="submit"
              variant="secondary"
              className="rounded-none rounded-r-md"
              aria-label={dict['search.search']}
            >
              <Icons.search className="h-5 w-5" />
            </Button>
          </div>
        </form>
      </PopoverAnchor>
      <PopoverContent
        className="p-0"
        onOpenAutoFocus={handleOpenChange}
        align="start"
      >
        <Command>
          <CommandGroup>
            {searchOptions.map((term) => (
              <CommandItem
                key={term.value}
                onSelect={() => {
                  searchForTerm(term);
                }}
                className="cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-700"
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
