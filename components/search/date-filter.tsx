'use client';

import { ChangeEvent, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getDictionary } from '@/dictionaries/dictionaries';
import { useDebounce } from '@/util/debounce';
import { ChevronsUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface DateFilterProps {
  params: any;
}

export function DateFilter({ params }: DateFilterProps) {
  const dict = getDictionary();
  const router = useRouter();
  const pathname = usePathname();

  const [fromYear, setFromYear] = useState(params?.startYear || '');
  const [toYear, setToYear] = useState(params?.endYear || '');
  const [isOpen, setIsOpen] = useState(params?.startYear || params?.endYear);

  const displayName = dict['index.art.date'];
  const fromYearName = dict['index.art.date.from'];
  const toYearName = dict['index.art.date.to'];

  const debouncedRequest = useDebounce(() => {
    const updatedParams = new URLSearchParams(params);
    updatedParams.delete('startYear');
    updatedParams.delete('endYear');
    if (fromYear) updatedParams.set('startYear', fromYear);
    if (toYear) updatedParams.set('endYear', toYear);
    updatedParams.delete('p');
    router.push(`${pathname}?${updatedParams}`);
  });

  const onFromYearChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFromYear(e.target.value);
    debouncedRequest();
  };

  const onToYearChange = (e: ChangeEvent<HTMLInputElement>) => {
    setToYear(e.target.value);
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
              name="fromYear"
              type="number"
              placeholder={'YYYY'}
              onChange={onFromYearChange}
              value={fromYear}
            />
          </div>
          <div>
            <Label className="mb-2" htmlFor="email">
              {toYearName}
            </Label>
            <Input
              className="w-20"
              name="toYear"
              type="number"
              placeholder={'YYYY'}
              onChange={onToYearChange}
              value={toYear}
            />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
