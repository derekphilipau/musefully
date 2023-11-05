/**
 *  Unfortunately GPT-3.5 isn't good at standardizing date formats.
 *  Parse a date string into a date range of date strings.
 */
import { format, lastDayOfMonth } from 'date-fns';

export type DateRange = {
  startDate?: string;
  endDate?: string;
};

/**
 * Attempts to parse a date string into a Date object.
 * This function is basic and assumes some standard date formats.
 * You might need to extend this function to handle more date formats.
 * @param datePart The date string part to parse.
 * @returns The parsed Date object.
 */
function parseDate(dateStr: string): string | undefined {
  dateStr = dateStr.trim();
  const currentYear = new Date().getFullYear();

  if (/^[A-Za-z]+$/.test(dateStr)) {
    // Only a month is present (no digits), return last day of month, assume current year
    const lastDay = lastDayOfMonth(new Date(`${dateStr} 1, ${currentYear}`));
    return format(lastDay, 'yyyy-MM-dd');
  }

  // get date parts with optional comma after date:
  // e.g. "January 1, 2021", "January 1 2021", "Jan 1, 2021", "Jan 1 2021", "Jan 2021", "Jan 1"
  const dateParts = dateStr.match(/([A-Za-z]+) (\d+)\,?(\s\d+)?$/);
  if (!dateParts) {
    return;
  }
  if (dateParts[1]?.trim().length >= 3) {
    // We have a month, e.g. Sep or September
    if (dateParts[2]?.trim().length === 4) {
      // month year format
      const month = dateParts[1].trim();
      const year = dateParts[2].trim();
      const lastDay = lastDayOfMonth(new Date(`${month} 1, ${year}`));
      return format(lastDay, 'yyyy-MM-dd');
    }
    if (dateParts[3]?.trim().length === 4) {
      // month day, year format
      const fullDate = new Date(
        `${dateParts[1].trim()} ${dateParts[2].trim()} ${dateParts[3].trim()}`
      );
      return format(fullDate, 'yyyy-MM-dd');
    }
    if (dateParts[2]?.length > 0) {
      // month day format
      const fullDate = new Date(
        `${dateParts[1].trim()} ${dateParts[2].trim()}, ${currentYear}`
      );
      return format(fullDate, 'yyyy-MM-dd');
    }
  }
}

/**
 * Parse a date string that could represent a range or a single date.
 * @param dateStr The date string to parse.
 * @returns An object containing the start date (if available) and end date.
 */
export function parseDateRange(dateStr: string): DateRange {
  const cleanedDateStr = dateStr
    .replace(/[\n\r]+/g, ' ') // Replace newlines
    .replace(/(?<=\d)(st|nd|rd|th),?/g, '') // Remove ordinal suffixes
    .replace(/^(Through|Until|To) /, '') // Remove "Through " prefix
    .replace(/Spring/g, 'June 30') // Approximate seasons
    .replace(/Summer/g, 'September 30')
    .replace(/Fall/g, 'December 31')
    .replace(/Winter/g, 'March 31')
    .trim();
  if (!cleanedDateStr || cleanedDateStr === 'Ongoing') {
    return {};
  }

  const patterns = [
    /(.+)\s*[\u2014-]\s*(.+)/, // Including the em dash (\u2014) in the regex
    /(.+)\s+to\s+(.+)/i,
  ];
  for (const pattern of patterns) {
    const match = cleanedDateStr.match(pattern);
    if (match?.length === 3) {
      return {
        startDate: parseDate(match[1]),
        endDate: parseDate(match[2]),
      };
    }
  }

  // If no range is found, assume it's a single date.
  return {
    endDate: parseDate(cleanedDateStr),
  };
}
