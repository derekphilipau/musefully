import Link from 'next/link';
import { getDictionary } from '@/dictionaries/dictionaries';

import { buttonVariants } from '@/components/ui/button';
import { Icons } from '@/components/icons';
export default function Page() {
  const dict = getDictionary();

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter sm:text-3xl md:text-5xl lg:text-6xl">
          {dict['home.title']}
        </h1>
        <p className="max-w-[700px] text-lg text-neutral-700 dark:text-neutral-400 sm:text-xl">
          {dict['home.summary']}
        </p>
      </div>
      <div className="flex gap-4">
        <Link
          href="/search/collections?hasPhoto=true&f=true"
          className={buttonVariants({ size: 'lg' })}
        >
          <Icons.search className="mr-2 h-5 w-5" />
          {dict['home.button.label']}
        </Link>
        <Link
          href="https://github.com/derekphilipau/museum-nextjs-search"
          className={buttonVariants({ size: 'lg', variant: 'outline' })}
        >
          <Icons.github className="mr-2 h-5 w-5" />
          Github
        </Link>
      </div>
    </section>
  );
}
