import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';

function NotFound() {
  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-5xl font-extrabold leading-tight tracking-tighter sm:text-5xl md:text-7xl lg:text-8xl">
          404
        </h1>
        <h2 className="text-3xl font-extrabold leading-tight tracking-tighter sm:text-3xl md:text-5xl lg:text-6xl">
          Page not found
        </h2>
        <p className="max-w-[700px] text-lg text-neutral-700 dark:text-neutral-400 sm:text-xl">
          The requested page could not be found.
        </p>
      </div>
      <div className="">
        <Link href="/" className={buttonVariants({ size: 'lg' })}>
          Go to home
        </Link>
      </div>
    </section>
  );
}

export default NotFound;
