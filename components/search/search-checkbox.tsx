'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface SearchCheckboxProps {
  params?: any;
  name: string;
  value: boolean;
  label: string;
}

export function SearchCheckbox({
  params,
  name,
  value,
  label,
}: SearchCheckboxProps) {
  const router = useRouter();
  const pathname = usePathname();

  function checkValue(checked: boolean) {
    const updatedParams = new URLSearchParams(params);
    if (checked) updatedParams.set(name, checked + '');
    else updatedParams.delete(name);
    updatedParams.delete('p');
    router.push(`${pathname}?${updatedParams}`);
  }

  return (
    <>
      <Switch
        id={name}
        onCheckedChange={(checked) => checkValue(checked)}
        checked={value}
        aria-labelledby={`label-${name}`}
      />
      <Label
        htmlFor={name}
        id={`label-${name}`}
        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
      </Label>
    </>
  );
}
