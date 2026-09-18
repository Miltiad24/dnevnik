import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { TaskCard } from "@/components/planner/task-card";
import {
  dayNumber,
  getWeekDays,
  isTodayDate,
  monthDay,
  toISODate,
  weekdayLong,
  weekdayShort,
} from "@/lib/planner/dates";
import type { Subject, Task } from "@/lib/planner/types";
import { cn } from "@/lib/utils";

type WeekViewProps = {
  tasks: Task[];
  subjects: Subject[];
  onToggle: (id: string) => void;
  onOpen: (id: string) => void;
  onAdd: (date: string) => void;
};

function WeekView({ tasks, subjects, onToggle, onOpen, onAdd }: WeekViewProps) {
  const days = useMemo(() => getWeekDays(new Date()), []);
  const [selected, setSelected] = useState(() => toISODate(new Date()));
  const byId = new Map(subjects.map((s) => [s.id, s]));
  const selectedDate = days.find((d) => toISODate(d) === selected) ?? new Date();

  const dayTasks = tasks
    .filter((t) => t.dueDate === selected)
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "todo" ? -1 : 1;
      return (a.dueTime || "99:99").localeCompare(b.dueTime || "99:99");
    });

  const counts = new Map<string, { open: number; done: number }>();
  for (const t of tasks) {
    const cur = counts.get(t.dueDate) ?? { open: 0, done: 0 };
    if (t.status === "done") cur.done += 1;
    else cur.open += 1;
    counts.set(t.dueDate, cur);
  }

  const open = dayTasks.filter((t) => t.status === "todo").length;

  return (
    <div className="flex flex-col gap-5 pb-8">
      <header>
        <p className="text-sm font-medium uppercase tracking-wide text-muted">Неделя</p>
        <h1 className="font-display text-3xl font-medium tracking-tight text-ink">
          Расписание
        </h1>
      </header>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const iso = toISODate(day);
          const isSelected = iso === selected;
          const isToday = isTodayDate(iso);
          const count = counts.get(iso);
          const isSun = day.getDay() === 0;

          return (
            <button
              key={iso}
              type="button"
              onClick={() => setSelected(iso)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg py-2.5 transition-[background-color,color] duration-150 ease-out",
                isSelected ? "bg-ink text-sheet" : "bg-transparent text-ink hover:bg-paper-deep",
                isSun && !isSelected && "text-subtle",
              )}
            >
              <span className="text-xs font-medium uppercase tracking-wide opacity-70">
                {weekdayShort(day)}
              </span>
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-full font-display text-base tabular-nums",
                  isToday && !isSelected && "bg-accent text-accent-fg",
                )}
              >
                {dayNumber(day)}
              </span>
              <span className="flex h-1.5 items-center gap-0.5">
                {count && count.open > 0 && (
                  <span
                    className={cn(
                      "size-1 rounded-full",
                      isSelected ? "bg-sheet" : "bg-accent",
                    )}
                  />
                )}
                {count && count.done > 0 && !count.open && (
                  <span
                    className={cn(
                      "size-1 rounded-full",
                      isSelected ? "bg-sheet/50" : "bg-line",
                    )}
                  />
                )}
              </span>
            </button>
          );
        })}
      </div>

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-medium capitalize text-ink">{weekdayLong(selectedDate)}</h2>
            <p className="text-sm text-muted">
              {monthDay(selectedDate)}
              {open > 0 ? ` · ${open} в работе` : " · свободно"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onAdd(selected)}
            className="inline-flex size-11 items-center justify-center rounded-md bg-sheet text-ink shadow-[var(--shadow-sheet)]"
            aria-label="Добавить на этот день"
          >
            <Plus className="size-5" />
          </button>
        </div>

        {dayTasks.length === 0 ? (
          <p className="rounded-xl bg-sheet px-4 py-8 text-center text-sm text-muted shadow-[var(--shadow-sheet)]">
            В этот день заданий нет.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {dayTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                subject={byId.get(task.subjectId)}
                onToggle={onToggle}
                onOpen={onOpen}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export { WeekView };
