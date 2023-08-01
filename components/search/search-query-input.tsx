'use client';

import { ChangeEvent, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getDictionary } from '@/dictionaries/dictionaries';

import { useDebounce } from '@/util/debounce';
import { Input } from '@/components/ui/input';

interface SearchQueryInputProps {
  params?: any;
}

export function SearchQueryInput({ params }: SearchQueryInputProps) {
  const dict = getDictionary();
  const router = useRouter();
  const pathname = usePathname();

  const [value, setValue] = useState(params?.q || '');

  const debouncedRequest = useDebounce(() => {
    const updatedParams = new URLSearchParams(params);
    if (value) updatedParams.set('q', value);
    else updatedParams.delete('q');
    updatedParams.delete('p');
    router.push(`${pathname}?${updatedParams}`);
  });

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    debouncedRequest();
  };

  return (
    <Input
      name="query"
      placeholder={dict['search.search']}
      onChange={onChange}
      value={value}
    />
  );
}
