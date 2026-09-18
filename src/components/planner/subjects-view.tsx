import { Plus } from "lucide-react";
import { SUBJECT_COLOR_CLASS, type Subject, type Task } from "@/lib/planner/types";
import { cn } from "@/lib/utils";

type SubjectsViewProps = {
  subjects: Subject[];
  tasks: Task[];
  onOpen: (id: string) => void;
  onAdd: () => void;
};

function SubjectsView({ subjects, tasks, onOpen, onAdd }: SubjectsViewProps) {
  const openBySubject = new Map<string, number>();
  for (const t of tasks) {
    if (t.status === "todo") {
      openBySubject.set(t.subjectId, (openBySubject.get(t.subjectId) ?? 0) + 1);
    }
  }

  return (
    <div className="flex flex-col gap-5 pb-8">
      <header className="flex items-end justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-muted">Класс</p>
          <h1 className="font-display text-3xl font-medium tracking-tight text-ink">
            Предметы
          </h1>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex size-11 items-center justify-center rounded-md bg-sheet text-ink shadow-[var(--shadow-sheet)]"
          aria-label="Добавить предмет"
        >
          <Plus className="size-5" />
        </button>
      </header>

      {subjects.length === 0 ? (
        <p className="rounded-xl bg-sheet px-4 py-10 text-center text-sm text-muted shadow-[var(--shadow-sheet)]">
          Добавьте предметы — к ним будут привязаны задания.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {subjects.map((subject) => {
            const open = openBySubject.get(subject.id) ?? 0;
            return (
              <li key={subject.id}>
                <button
                  type="button"
                  onClick={() => onOpen(subject.id)}
                  className="relative flex w-full items-center gap-3 overflow-hidden rounded-xl bg-sheet px-4 py-3.5 pl-5 text-left shadow-[var(--shadow-sheet)]"
                >
                  <span
                    className={cn(
                      "absolute inset-y-0 left-0 w-1",
                      SUBJECT_COLOR_CLASS[subject.color],
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-ink">{subject.name}</span>
                    <span className="mt-0.5 block truncate text-sm text-muted">
                      {[subject.teacher, subject.room && `каб. ${subject.room}`]
                        .filter(Boolean)
                        .join(" · ") || "Без учителя"}
                    </span>
                  </span>
                  <span className="shrink-0 text-right text-sm tabular-nums text-muted">
                    {openCountLabel(open)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export { SubjectsView };

function openCountLabel(n: number): string {
  if (n === 0) return "чисто";
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return `${n} задание`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return `${n} задания`;
  return `${n} заданий`;
}
