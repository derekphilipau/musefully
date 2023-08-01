'use client';

import { useState } from 'react';

import type { CollectionObjectDocument } from '@/types/collectionObjectDocument';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MuseumMap } from './museum-map';

export function MuseumMapDialog({ item }: { item: CollectionObjectDocument }) {
  const [open, setOpen] = useState(false);

  if (!item?.id || !item?.museumLocation?.name || !item?.onView) return null;

  return (
    <>
      <div onClick={() => setOpen(true)} className="h-80 cursor-pointer">
        <h4 className="mb-4 text-sm font-semibold uppercase text-neutral-500 dark:text-neutral-400">
          Museum Map
        </h4>
        <MuseumMap item={item} />
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="h-full min-w-full">
          <DialogHeader>
            <DialogTitle className="z-50">{item.title}</DialogTitle>
          </DialogHeader>
          <div className="h-screen overflow-y-scroll">
            <div className="w-full">
              <div className="flex max-w-md justify-center">
                <MuseumMap item={item} />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
