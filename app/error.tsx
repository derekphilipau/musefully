'use client';

// https://nextjs.org/docs/app/building-your-application/routing/error-handling
// Error components must be Client Components
import { useEffect } from 'react';

import { buttonVariants } from '@/components/ui/button';

function getErrorMessage(error: Error) {
  if (!error?.message) return 'Unknown error';
  if (error.message.includes('ECONNREFUSED'))
    return 'Unable to connect to Elasticsearch Service';
  return error.message;
}

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter sm:text-3xl md:text-5xl lg:text-6xl">
          Error
        </h1>
        <p className="max-w-[700px] text-lg text-neutral-700 dark:text-neutral-400 sm:text-xl">
          {getErrorMessage(error)}
        </p>
      </div>
      <div className="">
        <button
          className={buttonVariants({ size: 'lg' })}
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
        >
          Try again
        </button>
      </div>
    </section>
  );
}
