import Link from 'next/link';
import { getDictionary } from '@/dictionaries/dictionaries';

import type { Term } from '@/types/term';

export function TermCard({ term }: { term: Term }) {
  const dict = getDictionary();
  let href = '';
  let fieldName = '';

  if (term.field === 'primaryConstituent.canonicalName') {
    fieldName = dict['field.primaryConstituent.canonicalName'];
    href = `/collections?primaryConstituent.canonicalName=${term.value}`;
  } else if (term.field === 'classification') {
    fieldName = dict['field.classification'];
    href = `/collections?classification=${term.value}`;
  } else if (term.field === 'collections') {
    fieldName = dict['field.departments'];
    href = `/collections?departments=${term.value}`;
  }

  return (
    <Link href={href}>
      <div className="bg-neutral-100 p-2 hover:bg-neutral-50 dark:bg-neutral-800 dark:hover:bg-neutral-700">
        <h5 className="text-sm font-semibold text-muted-foreground">{fieldName}</h5>
        <h4 className="font-semibold">{term.value}</h4>
        {term?.summary && (
          <span className="text-sm text-muted-foreground">
            {term.summary}
          </span>
        )}
      </div>
    </Link>
  );
}
