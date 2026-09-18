import {
  addDays,
  format,
  isBefore,
  isSameDay,
  parseISO,
  startOfDay,
  startOfWeek,
} from "date-fns";
import { ru } from "date-fns/locale";

export function toISODate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function parseISODate(iso: string): Date {
  return parseISO(`${iso}T12:00:00`);
}

export function todayISO(from = new Date()): string {
  return toISODate(from);
}

export function dateOffsetISO(days: number, from = new Date()): string {
  return toISODate(addDays(from, days));
}

export function getWeekDays(anchor = new Date()): Date[] {
  const start = startOfWeek(anchor, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function weekdayShort(date: Date): string {
  return format(date, "EEEEEE", { locale: ru });
}

export function weekdayLong(date: Date): string {
  return format(date, "EEEE", { locale: ru });
}

export function monthDay(date: Date): string {
  return format(date, "d MMMM", { locale: ru });
}

export function dayNumber(date: Date): string {
  return format(date, "d");
}

export function isPastDate(iso: string, now = new Date()): boolean {
  return isBefore(parseISODate(iso), startOfDay(now));
}

export function isTodayDate(iso: string, now = new Date()): boolean {
  return isSameDay(parseISODate(iso), now);
}

export function formatDueLabel(iso: string, time?: string): string {
  const date = parseISODate(iso);
  const day = isTodayDate(iso)
    ? "сегодня"
    : format(date, "d MMM", { locale: ru });
  return time ? `${day}, ${time}` : day;
}
