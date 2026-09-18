import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskCard } from "@/components/planner/task-card";
import { isPastDate, isTodayDate, monthDay, todayISO, weekdayLong } from "@/lib/planner/dates";
import type { Subject, Task } from "@/lib/planner/types";

type TodayViewProps = {
  tasks: Task[];
  subjects: Subject[];
  onToggle: (id: string) => void;
  onOpen: (id: string) => void;
  onAdd: () => void;
  onClearDone: () => void;
};

function sortTasks(a: Task, b: Task) {
  const pri = { high: 0, normal: 1, low: 2 };
  if (a.status !== b.status) return a.status === "todo" ? -1 : 1;
  if (a.priority !== b.priority) return pri[a.priority] - pri[b.priority];
  return (a.dueTime || "99:99").localeCompare(b.dueTime || "99:99");
}

function TodayView({ tasks, subjects, onToggle, onOpen, onAdd, onClearDone }: TodayViewProps) {
  const now = new Date();
  const today = todayISO();
  const byId = new Map(subjects.map((s) => [s.id, s]));

  const overdue = tasks
    .filter((t) => t.status === "todo" && isPastDate(t.dueDate, now))
    .sort(sortTasks);
  const todayOpen = tasks
    .filter((t) => t.status === "todo" && t.dueDate === today)
    .sort(sortTasks);
  const todayDone = tasks.filter((t) => isTodayDate(t.dueDate, now) && t.status === "done");

  const empty = overdue.length === 0 && todayOpen.length === 0;

  return (
    <div className="flex flex-col gap-6 pb-8">
      <header className="stagger-in">
        <p className="text-sm font-medium uppercase tracking-wide text-muted">
          {weekdayLong(now)}
        </p>
        <h1 className="font-display text-3xl font-medium tracking-tight text-ink">
          {monthDay(now)}
        </h1>
      </header>

      {overdue.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-danger">Просрочено</h2>
          <div className="flex flex-col gap-2">
            {overdue.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                subject={byId.get(task.subjectId)}
                onToggle={onToggle}
                onOpen={onOpen}
                showDate
              />
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted">На сегодня</h2>
          <span className="text-sm tabular-nums text-subtle">
            {todayOpen.length} ещё
          </span>
        </div>

        {empty && overdue.length === 0 ? (
          <EmptyDay onAdd={onAdd} />
        ) : todayOpen.length === 0 && overdue.length > 0 ? (
          <p className="rounded-xl bg-sheet px-4 py-6 text-center text-sm text-muted shadow-[var(--shadow-sheet)]">
            На сегодня всё закрыто. Осталась просрочка выше.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {todayOpen.map((task) => (
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

      {todayDone.length > 0 && (
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted">Сделано</h2>
            <button
              type="button"
              onClick={onClearDone}
              className="text-sm font-medium text-subtle hover:text-ink"
            >
              Очистить
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {todayDone.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                subject={byId.get(task.subjectId)}
                onToggle={onToggle}
                onOpen={onOpen}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function EmptyDay({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-sheet px-6 py-10 text-center shadow-[var(--shadow-sheet)]">
      <BookOpen className="size-8 text-accent" aria-hidden="true" />
      <p className="mt-3 font-medium text-ink">На сегодня ничего не задано</p>
      <p className="mt-1 max-w-xs text-sm text-muted">
        Добавьте упражнение, параграф или то, что нужно сдать.
      </p>
      <Button className="mt-5" onClick={onAdd}>
        Добавить задание
      </Button>
    </div>
  );
}

export { TodayView };
