import { Clock } from "lucide-react";
import { formatDueLabel } from "@/lib/planner/dates";
import {
  SUBJECT_COLOR_CLASS,
  type Subject,
  type Task,
} from "@/lib/planner/types";
import { cn } from "@/lib/utils";

type TaskCardProps = {
  task: Task;
  subject?: Subject;
  onToggle: (id: string) => void;
  onOpen: (id: string) => void;
  showDate?: boolean;
};

function TaskCard({ task, subject, onToggle, onOpen, showDate }: TaskCardProps) {
  const done = task.status === "done";
  const colorClass = subject ? SUBJECT_COLOR_CLASS[subject.color] : "bg-muted";

  return (
    <article
      className={cn(
        "relative flex gap-3 overflow-hidden rounded-xl bg-sheet p-3 pl-4 shadow-[var(--shadow-sheet)]",
        "transition-[opacity,transform] duration-150 ease-out",
        done && "opacity-55",
      )}
    >
      <span className={cn("absolute inset-y-0 left-0 w-1", colorClass)} />
      <button
        type="button"
        onClick={() => onToggle(task.id)}
        className={cn(
          "relative mt-0.5 size-6 shrink-0 rounded-full border-2 transition-[background-color,border-color] duration-150 ease-out",
          "after:absolute after:left-1/2 after:top-1/2 after:size-11 after:-translate-x-1/2 after:-translate-y-1/2",
          done ? "border-accent bg-accent" : "border-line bg-sheet",
        )}
        aria-label={done ? "Вернуть в работу" : "Отметить сделанным"}
      >
        <svg
          viewBox="0 0 16 16"
          className={cn(
            "absolute inset-0 m-auto size-3.5 text-accent-fg transition-[opacity,transform] duration-150",
            done ? "scale-100 opacity-100" : "scale-50 opacity-0",
          )}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
        </svg>
      </button>

      <button
        type="button"
        onClick={() => onOpen(task.id)}
        className="min-w-0 flex-1 text-left"
      >
        <p
          className={cn(
            "font-medium leading-snug text-ink",
            done && "text-muted line-through",
          )}
        >
          {task.title}
        </p>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-sm text-muted">
          <span>{subject?.name ?? "Без предмета"}</span>
          {(showDate || task.dueTime) && (
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" aria-hidden="true" />
              {formatDueLabel(task.dueDate, task.dueTime || undefined)}
            </span>
          )}
          {task.priority === "high" && !done && (
            <span className="font-medium text-danger">Срочно</span>
          )}
        </p>
      </button>
    </article>
  );
}

export { TaskCard };
