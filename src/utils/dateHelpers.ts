// Modern date utility functions using date-fns (replaces moment.js for better security and smaller bundle)

import {
  format,
  parseISO,
  isValid,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  addDays,
  addHours,
  addMinutes,
  subDays,
  subHours,
  subMinutes,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isSameDay,
  isSameWeek,
  isSameMonth,
  isSameYear,
  isAfter,
  isBefore,
  isToday,
  isThisWeek,
  isThisMonth,
  isThisYear,
  formatDistanceToNow,
  formatDistance,
} from 'date-fns';

// Common date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM d, yyyy',
  DISPLAY_WITH_TIME: 'MMM d, yyyy h:mm a',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  ISO_DATE: 'yyyy-MM-dd',
  TIME: 'h:mm a',
  FULL: 'EEEE, MMMM d, yyyy',
  SHORT: 'M/d/yyyy',
  MONTH_YEAR: 'MMMM yyyy',
  YEAR: 'yyyy',
} as const;

/**
 * Format a date using the specified format
 */
export const formatDate = (date: Date | string | number, formatStr: string = DATE_FORMATS.DISPLAY): string => {
  const dateObj = parseDate(date);
  if (!dateObj) return 'Invalid Date';
  
  return format(dateObj, formatStr);
};

/**
 * Parse various date inputs into a Date object
 */
export const parseDate = (input: Date | string | number | null | undefined): Date | null => {
  if (!input) return null;
  
  if (input instanceof Date) {
    return isValid(input) ? input : null;
  }
  
  if (typeof input === 'number') {
    const date = new Date(input);
    return isValid(date) ? date : null;
  }
  
  if (typeof input === 'string') {
    // Try parsing as ISO string first
    try {
      const isoDate = parseISO(input);
      if (isValid(isoDate)) return isoDate;
    } catch {
      // Fall back to native Date parsing
    }
    
    const nativeDate = new Date(input);
    return isValid(nativeDate) ? nativeDate : null;
  }
  
  return null;
};

/**
 * Get relative time string (e.g., "2 hours ago", "in 3 days")
 */
export const getRelativeTime = (date: Date | string | number): string => {
  const dateObj = parseDate(date);
  if (!dateObj) return 'Invalid Date';
  
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

/**
 * Get the difference between two dates
 */
export const getDateDifference = (
  date1: Date | string | number,
  date2: Date | string | number,
  unit: 'days' | 'hours' | 'minutes' = 'days'
): number => {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);
  
  if (!d1 || !d2) return 0;
  
  switch (unit) {
    case 'days':
      return differenceInDays(d1, d2);
    case 'hours':
      return differenceInHours(d1, d2);
    case 'minutes':
      return differenceInMinutes(d1, d2);
    default:
      return differenceInDays(d1, d2);
  }
};

/**
 * Add time to a date
 */
export const addTime = (
  date: Date | string | number,
  amount: number,
  unit: 'days' | 'hours' | 'minutes'
): Date | null => {
  const dateObj = parseDate(date);
  if (!dateObj) return null;
  
  switch (unit) {
    case 'days':
      return addDays(dateObj, amount);
    case 'hours':
      return addHours(dateObj, amount);
    case 'minutes':
      return addMinutes(dateObj, amount);
    default:
      return dateObj;
  }
};

/**
 * Subtract time from a date
 */
export const subtractTime = (
  date: Date | string | number,
  amount: number,
  unit: 'days' | 'hours' | 'minutes'
): Date | null => {
  const dateObj = parseDate(date);
  if (!dateObj) return null;
  
  switch (unit) {
    case 'days':
      return subDays(dateObj, amount);
    case 'hours':
      return subHours(dateObj, amount);
    case 'minutes':
      return subMinutes(dateObj, amount);
    default:
      return dateObj;
  }
};

/**
 * Get start/end of time periods
 */
export const getTimeBounds = (
  date: Date | string | number,
  period: 'day' | 'week' | 'month' | 'year',
  bound: 'start' | 'end'
): Date | null => {
  const dateObj = parseDate(date);
  if (!dateObj) return null;
  
  const boundFunctions = {
    day: { start: startOfDay, end: endOfDay },
    week: { start: startOfWeek, end: endOfWeek },
    month: { start: startOfMonth, end: endOfMonth },
    year: { start: startOfYear, end: endOfYear },
  };
  
  return boundFunctions[period][bound](dateObj);
};

/**
 * Check if dates are in the same period
 */
export const isSamePeriod = (
  date1: Date | string | number,
  date2: Date | string | number,
  period: 'day' | 'week' | 'month' | 'year'
): boolean => {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);
  
  if (!d1 || !d2) return false;
  
  switch (period) {
    case 'day':
      return isSameDay(d1, d2);
    case 'week':
      return isSameWeek(d1, d2);
    case 'month':
      return isSameMonth(d1, d2);
    case 'year':
      return isSameYear(d1, d2);
    default:
      return false;
  }
};

/**
 * Check if date is in current period
 */
export const isCurrentPeriod = (
  date: Date | string | number,
  period: 'day' | 'week' | 'month' | 'year'
): boolean => {
  const dateObj = parseDate(date);
  if (!dateObj) return false;
  
  switch (period) {
    case 'day':
      return isToday(dateObj);
    case 'week':
      return isThisWeek(dateObj);
    case 'month':
      return isThisMonth(dateObj);
    case 'year':
      return isThisYear(dateObj);
    default:
      return false;
  }
};

/**
 * Compare dates
 */
export const compareDates = (
  date1: Date | string | number,
  date2: Date | string | number,
  comparison: 'before' | 'after' | 'same'
): boolean => {
  const d1 = parseDate(date1);
  const d2 = parseDate(date2);
  
  if (!d1 || !d2) return false;
  
  switch (comparison) {
    case 'before':
      return isBefore(d1, d2);
    case 'after':
      return isAfter(d1, d2);
    case 'same':
      return isSameDay(d1, d2);
    default:
      return false;
  }
};

/**
 * Generate an array of dates between two dates
 */
export const getDateRange = (
  startDate: Date | string | number,
  endDate: Date | string | number,
  step: 'day' | 'week' | 'month' = 'day'
): Date[] => {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  
  if (!start || !end || isAfter(start, end)) return [];
  
  const dates: Date[] = [];
  let current = start;
  
  while (!isAfter(current, end)) {
    dates.push(new Date(current));
    
    switch (step) {
      case 'day':
        current = addDays(current, 1);
        break;
      case 'week':
        current = addDays(current, 7);
        break;
      case 'month':
        current = addDays(current, 30); // Approximation
        break;
    }
  }
  
  return dates;
};

/**
 * Format duration between two dates
 */
export const formatDuration = (
  startDate: Date | string | number,
  endDate: Date | string | number
): string => {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  
  if (!start || !end) return 'Invalid duration';
  
  return formatDistance(start, end);
};

/**
 * Get business days between two dates (excludes weekends)
 */
export const getBusinessDays = (
  startDate: Date | string | number,
  endDate: Date | string | number
): number => {
  const start = parseDate(startDate);
  const end = parseDate(endDate);
  
  if (!start || !end) return 0;
  
  let count = 0;
  let current = start;
  
  while (!isAfter(current, end)) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
      count++;
    }
    current = addDays(current, 1);
  }
  
  return count;
};

/**
 * Validate if a string is a valid date
 */
export const isValidDateString = (dateString: string): boolean => {
  const date = parseDate(dateString);
  return date !== null;
};

/**
 * Get timezone offset in hours
 */
export const getTimezoneOffset = (): number => {
  return new Date().getTimezoneOffset() / -60;
};

/**
 * Convert date to timezone
 */
export const toTimezone = (date: Date | string | number, timezoneOffset: number): Date | null => {
  const dateObj = parseDate(date);
  if (!dateObj) return null;
  
  const localOffset = dateObj.getTimezoneOffset();
  const targetOffset = timezoneOffset * 60;
  const offsetDiff = targetOffset - localOffset;
  
  return addMinutes(dateObj, offsetDiff);
};

// Export commonly used functions with shorter names
export const now = () => new Date();
export const today = () => startOfDay(new Date());
export const tomorrow = () => startOfDay(addDays(new Date(), 1));
export const yesterday = () => startOfDay(subDays(new Date(), 1));