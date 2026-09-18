import { addDays } from "date-fns";
import { dateOffsetISO, isPastDate, todayISO } from "./dates";
import {
  DEFAULT_REMINDERS,
  SUBJECT_COLOR_HEX,
  type FiredLog,
  type ReminderSettings,
  type Subject,
  type Task,
} from "./types";

export type DueReminder = {
  id: string;
  title: string;
  body: string;
  at: number;
  kind: "evening" | "morning" | "task";
};

export type WidgetItem = {
  title: string;
  meta: string;
  color: string;
  urgent: boolean;
};

export type NativeSnapshot = {
  todayLeft: number;
  todayDone: number;
  overdue: number;
  headline: string;
  subhead: string;
  empty: boolean;
  items: WidgetItem[];
  reminders: Array<{ id: string; at: number; title: string; body: string }>;
};

export function tasksLabel(n: number): string {
  const abs = Math.abs(n) % 100;
  const d = abs % 10;
  const word =
    abs > 10 && abs < 20 ? "заданий" : d === 1 ? "задание" : d >= 2 && d <= 4 ? "задания" : "заданий";
  return `${n} ${word}`;
}

function parseHm(hm: string, day: Date): Date {
  const [hRaw, mRaw] = hm.split(":");
  const d = new Date(day);
  d.setHours(Number(hRaw) || 0, Number(mRaw) || 0, 0, 0);
  return d;
}

function nextDaily(hm: string, now: Date): Date {
  const todayAt = parseHm(hm, now);
  if (todayAt.getTime() > now.getTime()) return todayAt;
  return parseHm(hm, addDays(now, 1));
}

function subjectName(subjects: Subject[], id: string): string {
  return subjects.find((s) => s.id === id)?.name ?? "Предмет";
}

function sortOpen(a: Task, b: Task): number {
  const pri = { high: 0, normal: 1, low: 2 };
  if (a.priority !== b.priority) return pri[a.priority] - pri[b.priority];
  return (a.dueTime || "99:99").localeCompare(b.dueTime || "99:99");
}

export function openToday(tasks: Task[], now = new Date()): Task[] {
  const today = todayISO(now);
  return tasks.filter((t) => t.status === "todo" && t.dueDate === today).sort(sortOpen);
}

export function openOverdue(tasks: Task[], now = new Date()): Task[] {
  return tasks.filter((t) => t.status === "todo" && isPastDate(t.dueDate, now)).sort(sortOpen);
}

export function openTomorrow(tasks: Task[], now = new Date()): Task[] {
  const tomorrow = dateOffsetISO(1, now);
  return tasks.filter((t) => t.status === "todo" && t.dueDate === tomorrow).sort(sortOpen);
}

function eveningCopy(tasks: Task[], subjects: Subject[], now: Date): { title: string; body: string } {
  const tomorrow = openTomorrow(tasks, now);
  const overdue = openOverdue(tasks, now);
  const first = tomorrow[0];
  const title = tomorrow.length > 0 ? `На завтра ${tasksLabel(tomorrow.length)}` : "Вечерний дневник";
  const bits: string[] = [];
  if (first) bits.push(`${subjectName(subjects, first.subjectId)}: ${first.title}`);
  if (overdue.length > 0) bits.push(`ещё ${tasksLabel(overdue.length)} просрочено`);
  if (bits.length === 0) bits.push("На завтра пока пусто — можно выдохнуть.");
  return { title, body: bits.join(". ") };
}

function morningCopy(tasks: Task[], subjects: Subject[], now: Date): { title: string; body: string } {
  const today = openToday(tasks, now);
  const overdue = openOverdue(tasks, now);
  const first = today[0] ?? overdue[0];
  const title =
    today.length > 0 ? `Сегодня ${tasksLabel(today.length)}` : overdue.length > 0 ? "Есть просрочка" : "Доброе утро";
  const bits: string[] = [];
  if (first) bits.push(first.title);
  if (overdue.length > 0 && today.length > 0) bits.push(`просрочено ${tasksLabel(overdue.length)}`);
  if (bits.length === 0) bits.push("На сегодня заданий нет.");
  return { title, body: bits.join(". ") };
}

export function upcomingReminders(
  tasks: Task[],
  subjects: Subject[],
  settings: ReminderSettings,
  now = new Date(),
): DueReminder[] {
  const list: DueReminder[] = [];

  if (settings.morningEnabled) {
    const at = nextDaily(settings.morningTime, now);
    const copy = morningCopy(tasks, subjects, at);
    list.push({ id: "morning", kind: "morning", at: at.getTime(), ...copy });
  }

  if (settings.eveningEnabled) {
    const at = nextDaily(settings.eveningTime, now);
    const copy = eveningCopy(tasks, subjects, at);
    list.push({ id: "evening", kind: "evening", at: at.getTime(), ...copy });
  }

  if (settings.beforeDueEnabled) {
    const minutes = settings.beforeDueMinutes;
    for (const task of tasks) {
      if (task.status !== "todo" || !task.dueTime) continue;
      const due = new Date(`${task.dueDate}T${task.dueTime}:00`);
      if (Number.isNaN(due.getTime())) continue;
      const at = new Date(due.getTime() - minutes * 60_000);
      if (at.getTime() + 60_000 < now.getTime()) continue;
      const subj = subjectName(subjects, task.subjectId);
      list.push({
        id: `task:${task.id}`,
        kind: "task",
        at: at.getTime(),
        title: `Через ${minutes} мин · ${subj}`,
        body: task.title,
      });
    }
  }

  return list.sort((a, b) => a.at - b.at).slice(0, 16);
}

export function collectDue(
  tasks: Task[],
  subjects: Subject[],
  settings: ReminderSettings,
  fired: FiredLog,
  now = new Date(),
): DueReminder | null {
  const today = todayISO(now);
  const hm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  if (settings.morningEnabled && hm >= settings.morningTime && fired.morningDate !== today) {
    const todayOpen = openToday(tasks, now);
    const overdue = openOverdue(tasks, now);
    if (todayOpen.length > 0 || overdue.length > 0) {
      return { id: "morning", kind: "morning", at: now.getTime(), ...morningCopy(tasks, subjects, now) };
    }
  }

  if (settings.eveningEnabled && hm >= settings.eveningTime && fired.eveningDate !== today) {
    const tomorrow = openTomorrow(tasks, now);
    const overdue = openOverdue(tasks, now);
    if (tomorrow.length > 0 || overdue.length > 0) {
      return { id: "evening", kind: "evening", at: now.getTime(), ...eveningCopy(tasks, subjects, now) };
    }
  }

  if (settings.beforeDueEnabled) {
    const minutes = settings.beforeDueMinutes;
    for (const task of tasks) {
      if (task.status !== "todo" || !task.dueTime) continue;
      if (fired.tasks[task.id]) continue;
      const due = new Date(`${task.dueDate}T${task.dueTime}:00`);
      if (Number.isNaN(due.getTime())) continue;
      const fireAt = due.getTime() - minutes * 60_000;
      const expire = due.getTime() + 2 * 60 * 60_000;
      if (now.getTime() >= fireAt && now.getTime() < expire) {
        const subj = subjectName(subjects, task.subjectId);
        return {
          id: `task:${task.id}`,
          kind: "task",
          at: fireAt,
          title: `Скоро урок · ${subj}`,
          body: task.title,
        };
      }
    }
  }

  return null;
}

export function previewReminder(tasks: Task[], subjects: Subject[], now = new Date()): DueReminder {
  const today = openToday(tasks, now);
  const overdue = openOverdue(tasks, now);
  if (today.length === 0 && overdue.length === 0) {
    return {
      id: "test",
      kind: "morning",
      at: now.getTime(),
      title: "Дневник рядом",
      body: "Когда появится задание — напомню вечером и утром.",
    };
  }
  return {
    id: "test",
    kind: "morning",
    at: now.getTime(),
    ...morningCopy(tasks, subjects, now),
  };
}

export function widgetItems(tasks: Task[], subjects: Subject[], now = new Date()): WidgetItem[] {
  const byId = new Map(subjects.map((s) => [s.id, s]));
  const list = [...openOverdue(tasks, now), ...openToday(tasks, now)].slice(0, 3);
  return list.map((task) => {
    const subject = byId.get(task.subjectId);
    return {
      title: task.title,
      meta: [subject?.name, task.dueTime].filter(Boolean).join(" · "),
      color: subject ? SUBJECT_COLOR_HEX[subject.color] : "#6f675e",
      urgent: task.priority === "high" || isPastDate(task.dueDate, now),
    };
  });
}

export function buildSnapshot(
  tasks: Task[],
  subjects: Subject[],
  settings: ReminderSettings = DEFAULT_REMINDERS,
  now = new Date(),
): NativeSnapshot {
  const todayLeft = openToday(tasks, now).length;
  const overdue = openOverdue(tasks, now).length;
  const todayDone = tasks.filter((t) => t.status === "done" && t.dueDate === todayISO(now)).length;
  const items = widgetItems(tasks, subjects, now);
  const upcoming = upcomingReminders(tasks, subjects, settings, now);

  return {
    todayLeft,
    todayDone,
    overdue,
    headline: todayLeft > 0 ? tasksLabel(todayLeft) : "Пусто",
    subhead:
      overdue > 0
        ? `${tasksLabel(overdue)} просрочено`
        : todayLeft > 0
          ? "ещё сегодня"
          : "на сегодня чисто",
    empty: items.length === 0,
    items,
    reminders: upcoming.map((r) => ({ id: r.id, at: r.at, title: r.title, body: r.body })),
  };
}

export function showWebNotification(reminder: DueReminder): void {
  if (typeof Notification === "undefined") return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification(reminder.title, {
      body: reminder.body,
      tag: reminder.id,
      icon: "/icon-192.png",
    });
  } catch {
    // iframe / WebView may reject Notification
  }
}

export async function requestWebNotifications(): Promise<NotificationPermission | "unsupported"> {
  if (typeof Notification === "undefined") return "unsupported";
  try {
    if (Notification.permission === "granted") return "granted";
    return await Notification.requestPermission();
  } catch {
    return "unsupported";
  }
}

export function formatSoon(at: number, now = new Date()): string {
  const diff = at - now.getTime();
  if (diff < 60_000) return "сейчас";
  const mins = Math.round(diff / 60_000);
  if (mins < 60) return `через ${mins} мин`;
  const hours = Math.round(mins / 60);
  if (hours < 18) return `через ${hours} ч`;
  const when = new Date(at);
  const hh = String(when.getHours()).padStart(2, "0");
  const mm = String(when.getMinutes()).padStart(2, "0");
  const day = todayISO(when) === todayISO(now) ? "сегодня" : "завтра";
  return `${day} в ${hh}:${mm}`;
}