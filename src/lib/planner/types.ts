export const SUBJECT_COLORS = [
  "forest",
  "slate",
  "clay",
  "olive",
  "pine",
  "cedar",
] as const;

export type SubjectColor = (typeof SUBJECT_COLORS)[number];

export type Priority = "low" | "normal" | "high";
export type TaskStatus = "todo" | "done";
export type PlannerTab = "today" | "week" | "subjects" | "more";
export type BeforeDueMinutes = 15 | 30 | 60 | 120;

export type Subject = {
  id: string;
  name: string;
  teacher: string;
  room: string;
  color: SubjectColor;
};

export type Task = {
  id: string;
  title: string;
  notes: string;
  subjectId: string;
  dueDate: string;
  dueTime: string;
  priority: Priority;
  status: TaskStatus;
  createdAt: string;
};

export type ReminderSettings = {
  eveningEnabled: boolean;
  eveningTime: string;
  morningEnabled: boolean;
  morningTime: string;
  beforeDueEnabled: boolean;
  beforeDueMinutes: BeforeDueMinutes;
};

export type FiredLog = {
  eveningDate?: string;
  morningDate?: string;
  tasks: Record<string, string>;
};

export type PlannerData = {
  subjects: Subject[];
  tasks: Task[];
  reminders: ReminderSettings;
  fired: FiredLog;
  seeded: boolean;
};

export const SUBJECT_COLOR_CLASS: Record<SubjectColor, string> = {
  forest: "bg-sub-forest",
  slate: "bg-sub-slate",
  clay: "bg-sub-clay",
  olive: "bg-sub-olive",
  pine: "bg-sub-pine",
  cedar: "bg-sub-cedar",
};

export const SUBJECT_COLOR_TEXT: Record<SubjectColor, string> = {
  forest: "text-sub-forest",
  slate: "text-sub-slate",
  clay: "text-sub-clay",
  olive: "text-sub-olive",
  pine: "text-sub-pine",
  cedar: "text-sub-cedar",
};

export const SUBJECT_COLOR_HEX: Record<SubjectColor, string> = {
  forest: "#2a5f52",
  slate: "#3f5364",
  clay: "#7c5648",
  olive: "#5a6040",
  pine: "#3d6b55",
  cedar: "#6b4e3a",
};

export const PRIORITY_LABEL: Record<Priority, string> = {
  low: "Не горит",
  normal: "Обычное",
  high: "Срочно",
};

export const DEFAULT_REMINDERS: ReminderSettings = {
  eveningEnabled: true,
  eveningTime: "20:00",
  morningEnabled: true,
  morningTime: "07:30",
  beforeDueEnabled: true,
  beforeDueMinutes: 60,
};

export const EMPTY_FIRED: FiredLog = { tasks: {} };
