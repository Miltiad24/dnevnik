import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { dateOffsetISO, todayISO } from "./dates";
import type { DueReminder } from "./reminders";
import { plannerStateStorage } from "./storage";
import {
  DEFAULT_REMINDERS,
  EMPTY_FIRED,
  type FiredLog,
  type PlannerData,
  type Priority,
  type ReminderSettings,
  type Subject,
  type SubjectColor,
  type Task,
} from "./types";

type PlannerState = PlannerData & {
  addSubject: (input: Omit<Subject, "id">) => string;
  updateSubject: (id: string, patch: Partial<Omit<Subject, "id">>) => void;
  deleteSubject: (id: string) => void;
  addTask: (input: Omit<Task, "id" | "createdAt" | "status"> & { status?: Task["status"] }) => string;
  updateTask: (id: string, patch: Partial<Omit<Task, "id" | "createdAt">>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  clearDone: () => void;
  updateReminders: (patch: Partial<ReminderSettings>) => void;
  markFired: (reminder: DueReminder) => void;
  ensureSeed: () => void;
};

function uid(): string {
  return crypto.randomUUID();
}

function seedData(): Pick<PlannerData, "subjects" | "tasks"> {
  const subjects: Subject[] = [
    { id: "sub-math", name: "Математика", teacher: "Иванова Е. П.", room: "214", color: "forest" },
    { id: "sub-rus", name: "Русский язык", teacher: "Соколова Н. И.", room: "108", color: "clay" },
    { id: "sub-eng", name: "Английский", teacher: "Brown A.", room: "312", color: "slate" },
    { id: "sub-phys", name: "Физика", teacher: "Орлов Д. С.", room: "401", color: "olive" },
    { id: "sub-hist", name: "История", teacher: "Крылова Т. В.", room: "205", color: "cedar" },
    { id: "sub-lit", name: "Литература", teacher: "Соколова Н. И.", room: "108", color: "pine" },
  ];

  const now = new Date().toISOString();
  const tasks: Task[] = [
    {
      id: "task-phys",
      title: "Лабораторная: закон Ома",
      notes: "Оформить таблицу измерений и вывод в тетради.",
      subjectId: "sub-phys",
      dueDate: dateOffsetISO(-1),
      dueTime: "09:00",
      priority: "high",
      status: "todo",
      createdAt: now,
    },
    {
      id: "task-math",
      title: "№ 245–248, учебник",
      notes: "Решить с проверкой. Сложные — на полях.",
      subjectId: "sub-math",
      dueDate: dateOffsetISO(0),
      dueTime: "08:30",
      priority: "high",
      status: "todo",
      createdAt: now,
    },
    {
      id: "task-lit",
      title: "Глава 4, вопросы 1–6",
      notes: "«Отцы и дети». Кратко законспектировать спор Базарова.",
      subjectId: "sub-lit",
      dueDate: dateOffsetISO(0),
      dueTime: "11:20",
      priority: "normal",
      status: "todo",
      createdAt: now,
    },
    {
      id: "task-rus",
      title: "Упражнение 132",
      notes: "Причастия. Выписать примеры в тетрадь.",
      subjectId: "sub-rus",
      dueDate: dateOffsetISO(0),
      dueTime: "",
      priority: "normal",
      status: "done",
      createdAt: now,
    },
    {
      id: "task-sat",
      title: "Контурная карта, губернии",
      notes: "Подписать и раскрасить по учебнику, параграф 12.",
      subjectId: "sub-hist",
      dueDate: dateOffsetISO(1),
      dueTime: "10:00",
      priority: "low",
      status: "todo",
      createdAt: now,
    },
    {
      id: "task-eng",
      title: "Words, unit 4",
      notes: "Выучить 20 слов, устно 5 предложений.",
      subjectId: "sub-eng",
      dueDate: dateOffsetISO(3),
      dueTime: "12:00",
      priority: "normal",
      status: "todo",
      createdAt: now,
    },
    {
      id: "task-hist",
      title: "Параграф 12, вопросы 1–5",
      notes: "Реформы Александра II — таблица в тетради.",
      subjectId: "sub-hist",
      dueDate: dateOffsetISO(4),
      dueTime: "09:40",
      priority: "normal",
      status: "todo",
      createdAt: now,
    },
  ];

  return { subjects, tasks };
}

export const usePlannerStore = create<PlannerState>()(
  persist(
    (set, get) => ({
      subjects: [],
      tasks: [],
      reminders: { ...DEFAULT_REMINDERS },
      fired: { ...EMPTY_FIRED, tasks: {} },
      seeded: false,

      addSubject: (input) => {
        const id = uid();
        set((s) => ({ subjects: [...s.subjects, { ...input, id }] }));
        return id;
      },

      updateSubject: (id, patch) => {
        set((s) => ({
          subjects: s.subjects.map((sub) => (sub.id === id ? { ...sub, ...patch } : sub)),
        }));
      },

      deleteSubject: (id) => {
        set((s) => ({
          subjects: s.subjects.filter((sub) => sub.id !== id),
          tasks: s.tasks.filter((task) => task.subjectId !== id),
        }));
      },

      addTask: (input) => {
        const id = uid();
        const task: Task = {
          ...input,
          id,
          status: input.status ?? "todo",
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ tasks: [task, ...s.tasks] }));
        return id;
      },

      updateTask: (id, patch) => {
        set((s) => ({
          tasks: s.tasks.map((task) => (task.id === id ? { ...task, ...patch } : task)),
        }));
      },

      toggleTask: (id) => {
        set((s) => ({
          tasks: s.tasks.map((task) =>
            task.id === id
              ? { ...task, status: task.status === "done" ? "todo" : "done" }
              : task,
          ),
        }));
      },

      deleteTask: (id) => {
        set((s) => ({ tasks: s.tasks.filter((task) => task.id !== id) }));
      },

      clearDone: () => {
        set((s) => ({ tasks: s.tasks.filter((task) => task.status !== "done") }));
      },

      updateReminders: (patch) => {
        set((s) => ({ reminders: { ...s.reminders, ...patch } }));
      },

      markFired: (reminder) => {
        const today = todayISO();
        set((s) => {
          if (reminder.kind === "evening") {
            return { fired: { ...s.fired, eveningDate: today } };
          }
          if (reminder.kind === "morning") {
            return { fired: { ...s.fired, morningDate: today } };
          }
          const taskId = reminder.id.startsWith("task:") ? reminder.id.slice(5) : reminder.id;
          return {
            fired: {
              ...s.fired,
              tasks: { ...s.fired.tasks, [taskId]: new Date().toISOString() },
            },
          };
        });
      },

      ensureSeed: () => {
        if (get().seeded) return;
        set({ ...seedData(), seeded: true });
      },
    }),
    {
      name: "dnevnik-planner-v1",
      storage: createJSONStorage(() => plannerStateStorage()),
      skipHydration: true,
      partialize: (s) => ({
        subjects: s.subjects,
        tasks: s.tasks,
        reminders: s.reminders,
        fired: s.fired,
        seeded: s.seeded,
      }),
      merge: (persisted, current) => {
        const data = (persisted ?? {}) as Partial<PlannerData>;
        const hasData = (data.subjects?.length ?? 0) > 0 || (data.tasks?.length ?? 0) > 0;
        return {
          ...current,
          ...data,
          reminders: { ...DEFAULT_REMINDERS, ...data.reminders },
          fired: {
            eveningDate: data.fired?.eveningDate,
            morningDate: data.fired?.morningDate,
            tasks: { ...(data.fired?.tasks ?? {}) },
          },
          seeded: data.seeded ?? hasData,
        };
      },
    },
  ),
);

export function newSubjectDraft(): Omit<Subject, "id"> {
  return { name: "", teacher: "", room: "", color: "forest" as SubjectColor };
}

export function newTaskDraft(preset?: { dueDate?: string; subjectId?: string }): Omit<
  Task,
  "id" | "createdAt" | "status"
> {
  return {
    title: "",
    notes: "",
    subjectId: preset?.subjectId ?? "",
    dueDate: preset?.dueDate ?? dateOffsetISO(0),
    dueTime: "",
    priority: "normal" as Priority,
  };
}