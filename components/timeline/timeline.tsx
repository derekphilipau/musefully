'use client';

import React, { Key, useRef, useState } from 'react';
import { getDictionary } from '@/dictionaries/dictionaries';
import { AxisLeft, AxisTop } from '@visx/axis';
import { Group } from '@visx/group';
import { scaleBand, scaleLinear } from '@visx/scale';
import { Bar } from '@visx/shape';
import { Text } from '@visx/text';
import { format } from 'date-fns';

import type { BaseDocument, EventDocument } from '@/types/document';
import { sources } from '@/config/sources';
import { getFormattedItemDates } from '@/lib/various';
import { RemoteImage } from '../image/remote-image';

const sourceColors = {
  'New York': '#0ea5e9',
  Chicago: '#a855f7',
  'Los Angeles': '#6366f1',
  'San Francisco': '#14b8a6',
  Washington: '#22c55e',
  Philadelphia: '#eab308',
  Boston: '#ef4444',
};

// Define your margins
const margin = { top: 40, right: 10, bottom: 10, left: 10 };

// Define the size of your chart
const width = 1200; // You can adjust this as needed
const height = 600; // You can adjust this as needed
// maxDate should be X months from today:
const maxDate = new Date(new Date().setMonth(new Date().getMonth() + 6))
  .toISOString()
  .split('T')[0];

function getBarText(item: BaseDocument | EventDocument) {
  // get item title.  if > 40 chars, truncate and add ellipsis:
  const myTitle =
    item.title && item.title?.length > 40
      ? `${item.title?.substring(0, 40)}...`
      : item.title;
  return `${myTitle} - ${item.source}`;
}

function getDomainMin(items: (BaseDocument | EventDocument)[]) {
  const min = Math.min(
    ...items
      .filter((item) => item.date)
      .map((item) => new Date(item.date || '').getTime())
  );
  return min;
}

function getDomainMax(items: (BaseDocument | EventDocument)[]) {
  const max = Math.max(
    ...items
      .filter((item): item is EventDocument => 'endDate' in item && item.endDate !== undefined)
      .map((item) => {
        // if item.endDate is greater than 5 years into future, don't use it:
        const endDate = new Date(item.endDate || '').getTime();
        return endDate >
          new Date(
            new Date().setFullYear(new Date().getFullYear() + 5)
          ).getTime()
          ? new Date(maxDate).getTime()
          : endDate;
      })
  );
  return max;
}

interface TimelineProps {
  items: (BaseDocument | EventDocument)[];
}

export function Timeline({ items }: TimelineProps) {
  const dict = getDictionary();
  // create a new array of items, sorted by location:
  const sortedItems = items.sort((a, b) => {
    if (a.sourceId && b.sourceId) {
      const locationA = a.sourceId && sources[a.sourceId]?.location;
      const locationB = b.sourceId && sources[b.sourceId]?.location;

      // Compare by location first
      if (locationA && locationB) {
        if (locationA < locationB) return -1;
        if (locationA > locationB) return 1;

        // If locations are the same, then sort by sourceId
        return a.sourceId < b.sourceId ? -1 : a.sourceId > b.sourceId ? 1 : 0;
      }
    }
    return 0;
  });

  // for each item, if endDate > maxTime, set endDate to maxTime
  const maxTime = getDomainMax(sortedItems);
  const maxDate = format(new Date(maxTime), 'yyyy-MM-dd');
  const minTime = getDomainMin(sortedItems);
  const minDate = format(new Date(minTime), 'yyyy-MM-dd');
  sortedItems.forEach((item: EventDocument) => {
    // if item.endDate is greater than 5 years into future, don't use it:
    if (item.endDate) {
      const endDate = new Date(item.endDate).getTime();
      if (
        endDate >
        new Date(new Date().setFullYear(new Date().getFullYear() + 5)).getTime()
      ) {
        item.endDate = format(new Date(maxTime), 'yyyy-MM-dd');
      }
    }
  });

  const timeScale = scaleLinear({
    domain: [getDomainMin(sortedItems), getDomainMax(sortedItems)],
    range: [margin.left, width - margin.right], // Now for horizontal
  });

  const itemScale = scaleBand<string>({
    domain: sortedItems
      .filter((item) => item.title)
      .map((item) => item.title) as string[],
    range: [height - margin.bottom, margin.top],
    padding: 0.1,
  });

  const [hoveredItem, setHoveredItem] = useState<
    BaseDocument | EventDocument | null
  >(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const svgRef = useRef<SVGSVGElement>(null); // Ref to the SVG for positioning

  const currentDate = new Date();
  const currentTime = currentDate.getTime();

  return (
    <>
      <div className="w-full overflow-x-auto">
        <svg ref={svgRef} width={width} height={height}>
          <Group>
            {sortedItems.map((item: EventDocument, i: Key) => {
              // Swap the usage of scales for x and y
              const startX = timeScale(new Date(item.date || minDate).getTime());
              const endX = timeScale(new Date(item.endDate || maxDate).getTime());
              const barX = Math.min(startX, endX);
              const barWidth = Math.abs(endX - startX);
              const barY = itemScale(item.title || '') ?? 0;
              const barHeight = itemScale.bandwidth();
              const textY = barY + barHeight / 2;

              return (
                <React.Fragment key={`fragment-${item.title}`}>
                  <Bar
                    x={barX}
                    y={barY}
                    rx={4}
                    ry={4}
                    width={barWidth}
                    height={barHeight}
                    fill={
                      sourceColors[
                        sources[item.sourceId || '']?.location || ''
                      ] ?? '#000'
                    }
                    className="cursor-pointer"
                    onMouseEnter={(event) => {
                      const { clientX, clientY } = event;
                      // Set the position for the popover
                      setHoverPosition({
                        x:
                          clientX -
                          (svgRef.current?.getBoundingClientRect().left ?? 0),
                        y:
                          clientY -
                          (svgRef.current?.getBoundingClientRect().top ?? 0) +
                          200,
                      });
                      setHoveredItem(item);
                    }}
                    onMouseLeave={() => setHoveredItem(null)}
                  />
                  <Text
                    key={`text-${item.title}`}
                    x={barX + 6} // Start the text slightly inside the bar (5 pixels from the bar's start)
                    y={textY}
                    className="fill-foreground"
                    verticalAnchor="middle"
                    fontSize={10}
                    onMouseEnter={(event) => {
                      const { clientX, clientY } = event;
                      setHoverPosition({
                        x:
                          clientX -
                          (svgRef.current?.getBoundingClientRect().left ?? 0),
                        y:
                          clientY -
                          (svgRef.current?.getBoundingClientRect().top ?? 0) +
                          200,
                      });
                      setHoveredItem(item);
                    }}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {getBarText(item)}
                  </Text>
                </React.Fragment>
              );
            })}
            <AxisTop
              top={margin.top}
              scale={timeScale}
              tickFormat={(value: number) => {
                const date = new Date(value);
                // Use options to show full month name and year
                return format(date, 'd MMM yy');
              }}
              tickLabelProps={() => ({
                className: 'fill-foreground text-xs',
              })}
            />
            {/* Add the current time line */}
            <line
              x1={timeScale(currentTime)}
              x2={timeScale(currentTime)}
              y1={margin.top}
              y2={height - margin.bottom}
              stroke="red"
              strokeWidth={2}
            />
          </Group>
        </svg>
      </div>
      {hoveredItem && (
        <div
          className="pointer-events-none absolute z-50 w-[240px] rounded-lg bg-background p-2 text-xs shadow-lg"
          style={{
            left: `${hoverPosition.x}px`,
            top: `${hoverPosition.y}px`,
          }}
        >
          <RemoteImage
            item={hoveredItem}
            imageClassName="h-20 object-contain"
          />
          <div className="mt-2 font-bold">{hoveredItem.title}</div>
          <div>{hoveredItem.source}</div>
          <div>{sources[hoveredItem.sourceId || '']?.location}</div>
          <div>{getFormattedItemDates(hoveredItem, dict)}</div>
        </div>
      )}
    </>
  );
}

export default Timeline;
