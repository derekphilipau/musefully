import { Key } from 'react';
import Link from 'next/link';

export function DominantColors({ item, height = 10, isLinked = true }) {
  if (!item?.image?.dominantColors?.length) return null;

  // get total percent of all colors
  const totalPercent = item.image.dominantColors.reduce(
    (acc, color) => acc + color.percent,
    0
  );

  if (isLinked) {
    return (
      <div className="flex w-full items-center border border-neutral-200 dark:border-neutral-600">
        {item.image.dominantColors.map(
          (color, index: Key) =>
            color?.hex && (
              <Link
                className="rounded-none"
                key={index}
                href={`/art?hasPhoto=true&color=${color.hex}`}
                style={{
                  backgroundColor: `#${color.hex}`,
                  height: `${height}px`,
                  width: `${(color.percent * totalPercent) / 100}%`,
                }}
              ></Link>
            )
        )}
      </div>
    );
  }

  return (
    <div className="flex w-full items-center border border-neutral-200 dark:border-neutral-600">
      {item.image.dominantColors.map(
        (color, index: Key) =>
          color?.hex && (
            <div
              className="rounded-none"
              key={index}
              style={{
                backgroundColor: `#${color.hex}`,
                height: `${height}px`,
                width: `${(color.percent * totalPercent) / 100}%`,
              }}
            ></div>
          )
      )}
    </div>
  );
}
