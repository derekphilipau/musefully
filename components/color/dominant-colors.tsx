import Link from 'next/link';
import { getDictionary } from '@/dictionaries/dictionaries';
import type { DocumentImageDominantColor } from '@/types/document';

interface DominantColorsProps {
  item: {
    image?: {
      dominantColors?: DocumentImageDominantColor[];
    };
  };
  height?: number;
  isLinked?: boolean;
}

function normalizeHex(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const hex = trimmed.startsWith('#') ? trimmed.slice(1) : trimmed;
  return /^[0-9a-fA-F]{6}$/.test(hex) ? hex.toLowerCase() : null;
}

export function DominantColors({
  item,
  height = 10,
  isLinked = true,
}: DominantColorsProps) {
  const dict = getDictionary();
  const colors = item?.image?.dominantColors;
  if (!colors || colors.length === 0) return null;

  // get total percent of all colors
  const totalPercent = colors.reduce(
    (acc: number, color: DocumentImageDominantColor) => acc + color.percent,
    0
  );

  if (isLinked) {
    return (
      <div className="flex w-full items-center border border-neutral-200 dark:border-neutral-600">
        {colors.map((color: DocumentImageDominantColor, index: number) => {
          const hex = normalizeHex(color?.hex);
          if (!hex) return null;
          const widthPercent =
            totalPercent > 0 ? (color.percent / totalPercent) * 100 : 0;
          return (
            <Link
              className="rounded-none"
              key={index}
              href={`/art?hasPhoto=true&color=${hex}`}
              style={{
                backgroundColor: `#${hex}`,
                height: `${height}px`,
                width: `${widthPercent}%`,
              }}
              aria-label={`${dict['button.colorSearch']} #${hex}`}
            ></Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="flex w-full items-center border border-neutral-200 dark:border-neutral-600">
      {colors.map((color: DocumentImageDominantColor, index: number) => {
        const hex = normalizeHex(color?.hex);
        if (!hex) return null;
        const widthPercent =
          totalPercent > 0 ? (color.percent / totalPercent) * 100 : 0;
        return (
          <div
            className="rounded-none"
            key={index}
            style={{
              backgroundColor: `#${hex}`,
              height: `${height}px`,
              width: `${widthPercent}%`,
            }}
          ></div>
        );
      })}
    </div>
  );
}
