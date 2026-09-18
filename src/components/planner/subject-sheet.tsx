import { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { newSubjectDraft } from "@/lib/planner/store";
import {
  SUBJECT_COLOR_CLASS,
  SUBJECT_COLORS,
  type Subject,
  type SubjectColor,
} from "@/lib/planner/types";
import { cn } from "@/lib/utils";

type SubjectSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject?: Subject;
  onSave: (data: Omit<Subject, "id">, id?: string) => void;
  onDelete?: (id: string) => void;
};

function SubjectSheet({ open, onOpenChange, subject, onSave, onDelete }: SubjectSheetProps) {
  const draft = useMemo(
    () =>
      subject
        ? { name: subject.name, teacher: subject.teacher, room: subject.room, color: subject.color }
        : newSubjectDraft(),
    [subject, open],
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
    const name = form.name.trim();
    if (!name) {
      setError("Укажите название предмета");
      return;
    }
    onSave(
      {
        name,
        teacher: form.teacher.trim(),
        room: form.room.trim(),
        color: form.color,
      },
      subject?.id,
    );
    onOpenChange(false);
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent title={subject ? "Предмет" : "Новый предмет"}>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div className="flex flex-col gap-1.5">
            <Label>Название</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Математика"
              autoFocus={!subject}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Учитель</Label>
              <Input
                value={form.teacher}
                onChange={(e) => setForm({ ...form, teacher: e.target.value })}
                placeholder="Иванова Е. П."
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Кабинет</Label>
              <Input
                value={form.room}
                onChange={(e) => setForm({ ...form, room: e.target.value })}
                placeholder="214"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Цвет в дневнике</Label>
            <div className="flex gap-2">
              {SUBJECT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={color}
                  onClick={() => setForm({ ...form, color: color as SubjectColor })}
                  className={cn(
                    "size-9 rounded-full transition-[transform,box-shadow] duration-150 ease-out",
                    SUBJECT_COLOR_CLASS[color],
                    form.color === color
                      ? "scale-100 shadow-[0_0_0_3px_var(--color-paper),0_0_0_5px_var(--color-ink)]"
                      : "opacity-80",
                  )}
                />
              ))}
            </div>
          </div>
          {error && <p className="text-sm font-medium text-danger">{error}</p>}
          <div className="mt-2 flex gap-2">
            {subject && onDelete && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Удалить предмет"
                onClick={() => {
                  onDelete(subject.id);
                  onOpenChange(false);
                }}
              >
                <Trash2 />
              </Button>
            )}
            <Button type="submit" className="flex-1">
              Сохранить
            </Button>
          </div>
        </form>
      </DrawerContent>
    </Drawer>
  );
}

export { SubjectSheet };
