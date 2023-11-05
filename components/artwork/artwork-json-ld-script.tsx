import * as React from 'react';
import Script from 'next/script';

import type { ArtworkDocument } from '@/types/document';
import { getSchemaVisualArtworkJson } from '@/lib/schema';

interface ArtworkJsonLdScriptProps {
  artwork: ArtworkDocument;
}

export function ArtworkJsonLdScript({ artwork }: ArtworkJsonLdScriptProps) {
  const jsonLd = getSchemaVisualArtworkJson(artwork);

  if (!jsonLd) return null;

  return (
    <Script id="json-ld-script" type="application/ld+json">
      {jsonLd}
    </Script>
  );
}
