import Link from 'next/link';

import type { Term } from '@/types/term';

export function TermCard({ term }: { term: Term }) {
  let href = '';
  let name = '';

  if (term.field === 'primaryConstituent.canonicalName') {
    name = 'Artist';
    href = `/search/collections?primaryConstituent.canonicalName=${term.value}`;
  } else if (term.field === 'classification') {
    name = 'Classification';
    href = `/search/collections?classification=${term.value}`;
  } else if (term.field === 'collections') {
    name = 'Collection';
    href = `/search/collections?collections=${term.value}`;
  }

  return (
    <Link href={href}>
      <div className="bg-neutral-100 p-2 hover:bg-neutral-50 dark:bg-neutral-800 dark:hover:bg-neutral-700">
        <h5 className="text-sm">{name}</h5>
        <h4 className="font-semibold">{term.value}</h4>
        {term?.summary && (
          <span className="text-sm text-neutral-700 dark:text-neutral-400">
            {term.summary}
          </span>
        )}
      </div>
    </Link>
  );
}
