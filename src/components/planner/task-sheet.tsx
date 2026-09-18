import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { newTaskDraft } from "@/lib/planner/store";
import { PRIORITY_LABEL, type Priority, type Subject, type Task } from "@/lib/planner/types";
import { cn } from "@/lib/utils";

type TaskSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: Subject[];
  task?: Task;
  presetDate?: string;
  presetSubjectId?: string;
  onSave: (data: Omit<Task, "id" | "createdAt" | "status">, id?: string) => void;
  onDelete?: (id: string) => void;
};

const PRIORITIES: Priority[] = ["low", "normal", "high"];

function TaskSheet({
  open,
  onOpenChange,
  subjects,
  task,
  presetDate,
  presetSubjectId,
  onSave,
  onDelete,
}: TaskSheetProps) {
  const draft = useMemo(
    () =>
      task
        ? {
            title: task.title,
            notes: task.notes,
            subjectId: task.subjectId,
            dueDate: task.dueDate,
            dueTime: task.dueTime,
            priority: task.priority,
          }
        : newTaskDraft({ dueDate: presetDate, subjectId: presetSubjectId || subjects[0]?.id }),
    [task, presetDate, presetSubjectId, subjects, open],
  );

  const [form, setForm] = useState(draft);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(draft);
      setError("");
    }
  }, [open, draft]);

  function submit() {
    const title = form.title.trim();
    if (!title) {
      setError("Напишите, что задали");
      return;
    }
    if (!form.subjectId) {
      setError("Выберите предмет");
      return;
    }
    onSave({ ...form, title, notes: form.notes.trim() }, task?.id);
    onOpenChange(false);
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent title={task ? "Задание" : "Новое задание"}>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <Field label="Что задали">
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Номера, параграф, сочинение"
              autoFocus={!task}
            />
          </Field>

          <Field label="Предмет">
            <select
              value={form.subjectId}
              onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
              className="h-11 w-full rounded-md border border-line bg-sheet px-3 text-base text-ink outline-none focus-visible:border-accent"
            >
              {subjects.length === 0 && <option value="">Сначала добавьте предмет</option>}
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Срок">
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </Field>
            <Field label="К уроку">
              <Input
                type="time"
                value={form.dueTime}
                onChange={(e) => setForm({ ...form, dueTime: e.target.value })}
              />
            </Field>
          </div>

          <Field label="Приоритет">
            <div className="grid grid-cols-3 gap-1 rounded-lg bg-paper-deep p-1">
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setForm({ ...form, priority: p })}
                  className={cn(
                    "h-10 rounded-md text-sm font-medium transition-[background-color,color] duration-150 ease-out",
                    form.priority === p ? "bg-sheet text-ink shadow-[var(--shadow-sheet)]" : "text-muted",
                  )}
                >
                  {PRIORITY_LABEL[p]}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Заметки">
            <Textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Страницы, что взять с собой"
              rows={3}
            />
          </Field>

          {error && <p className="text-sm font-medium text-danger">{error}</p>}

          <div className="mt-2 flex gap-2">
            {task && onDelete && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Удалить"
                onClick={() => {
                  onDelete(task.id);
                  onOpenChange(false);
                }}
              >
                <Trash2 />
              </Button>
            )}
            <Button type="submit" className="flex-1" disabled={subjects.length === 0}>
              Сохранить
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export { TaskSheet };
