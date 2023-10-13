'use client';

import { ChangeEvent, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getDictionary } from '@/dictionaries/dictionaries';
import { ChevronsUpDown } from 'lucide-react';

import { useDebounce } from '@/lib/debounce';
import {
  setYearRange,
  toURLSearchParams,
  type SearchParams,
} from '@/lib/elasticsearch/search/searchParams';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DateFilterProps {
  searchParams: SearchParams;
}

export function DateFilter({ searchParams }: DateFilterProps) {
  const dict = getDictionary();
  const router = useRouter();
  const pathname = usePathname();

  const [startYear, setFromYear] = useState<number | null>(
    searchParams?.startYear || null
  );
  const [endYear, setToYear] = useState<number | null>(
    searchParams?.endYear || null
  );
  const [isOpen, setIsOpen] = useState(
    searchParams?.startYear !== undefined || searchParams?.endYear !== undefined
  );

  const displayName = dict['index.art.date'];
  const fromYearName = dict['index.art.date.from'];
  const toYearName = dict['index.art.date.to'];

  const debouncedRequest = useDebounce(() => {
    const updatedParams = toURLSearchParams(
      setYearRange(searchParams, startYear, endYear)
    );
    router.push(`${pathname}?${updatedParams}`);
  });

  const onFromYearChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFromYear(e.target.value ? parseInt(e.target.value) : null);
    debouncedRequest();
  };

  const onToYearChange = (e: ChangeEvent<HTMLInputElement>) => {
    setToYear(e.target.value ? parseInt(e.target.value) : null);
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
          <h4 className="text-sm font-semibold">{displayName}</h4>
          <div>
            <ChevronsUpDown className="h-4 w-4" />
            <span className="sr-only">Toggle {displayName}</span>
          </div>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="w-full space-y-2">
        <div className="mb-2 flex flex-wrap gap-x-4">
          <div>
            <Label className="mb-2" htmlFor="email">
              {fromYearName}
            </Label>
            <Input
              className="w-20"
              name="startYear"
              type="number"
              placeholder={'YYYY'}
              onChange={onFromYearChange}
              value={startYear !== null ? startYear : ''}
            />
          </div>
          <div>
            <Label className="mb-2" htmlFor="email">
              {toYearName}
            </Label>
            <Input
              className="w-20"
              name="endYear"
              type="number"
              placeholder={'YYYY'}
              onChange={onToYearChange}
              value={endYear !== null ? endYear : ''}
            />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
