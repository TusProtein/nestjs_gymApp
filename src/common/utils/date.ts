import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { getDay } from 'date-fns';
import { Weekday } from '@prisma/client';

export const APP_TZ = 'Asia/Ho_Chi_Minh';

// FE -> BE -> DB
export function toUtc(date: string | Date): Date {
  return fromZonedTime(date, APP_TZ);
}

// DB -> FE
export function fromUtc(date: Date): Date {
  return toZonedTime(date, APP_TZ);
}

// Date -> Prisma Weekday enum
const DAY_MAP: Record<number, Weekday> = {
  0: Weekday.SUN,
  1: Weekday.MON,
  2: Weekday.TUE,
  3: Weekday.WED,
  4: Weekday.THU,
  5: Weekday.FRI,
  6: Weekday.SAT,
};

export function getWeekday(date: Date): Weekday {
  return DAY_MAP[getDay(fromUtc(date))];
}
