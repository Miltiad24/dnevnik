import { useState } from "react";
import { Bell, Download, Smartphone } from "lucide-react";
import { HomeWidgets } from "@/components/planner/home-widgets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isNativeApp, requestNativeNotifications } from "@/lib/planner/native";
import {
  formatSoon,
  previewReminder,
  requestWebNotifications,
  type DueReminder,
  type NativeSnapshot,
} from "@/lib/planner/reminders";
import { usePlannerStore } from "@/lib/planner/store";
import type { BeforeDueMinutes, Subject, Task } from "@/lib/planner/types";
import { cn } from "@/lib/utils";

const BEFORE_OPTIONS: { value: BeforeDueMinutes; label: string }[] = [
  { value: 15, label: "15 мин" },
  { value: 30, label: "30 мин" },
  { value: 60, label: "1 час" },
  { value: 120, label: "2 часа" },
];

type MoreViewProps = {
  tasks: Task[];
  subjects: Subject[];
  snapshot: NativeSnapshot;
  upcoming: DueReminder[];
  onTest: (reminder: DueReminder) => void;
  onInstall: () => void;
};

function MoreView({ tasks, subjects, snapshot, upcoming, onTest, onInstall }: MoreViewProps) {
  const reminders = usePlannerStore((s) => s.reminders);
  const updateReminders = usePlannerStore((s) => s.updateReminders);
  const [perm, setPerm] = useState<NotificationPermission | "unsupported">(
    typeof Notification === "undefined" ? "unsupported" : Notification.permission,
  );

  async function enableAlerts() {
    requestNativeNotifications();
    const result = await requestWebNotifications();
    setPerm(result);
  }

  return (
    <div className="flex flex-col gap-8 pb-8">
      <header className="stagger-in">
        <p className="text-sm font-medium uppercase tracking-wide text-muted">Телефон</p>
        <h1 className="font-display text-3xl font-medium tracking-tight text-ink">Рядом с уроками</h1>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted">
          Виджет на рабочем столе и напоминания вечером, утром и за час до урока.
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-medium tracking-tight">Виджеты</h2>
        <HomeWidgets
          todayLeft={snapshot.todayLeft}
          overdue={snapshot.overdue}
          headline={snapshot.headline}
          subhead={snapshot.subhead}
          items={snapshot.items}
        />
        <ol className="flex list-decimal flex-col gap-2 pl-5 text-sm leading-relaxed text-ink">
          <li>Установите Дневник из файла, если ещё не стоит.</li>
          <li>На рабочем столе — долгое нажатие → «Виджеты».</li>
          <li>Выберите «Дневник — сегодня» или «Дневник — список».</li>
        </ol>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-medium tracking-tight">Напоминания</h2>
        <div className="rounded-xl bg-sheet p-4 shadow-[var(--shadow-sheet)]">
          <ToggleRow
            label="Вечером, на завтра"
            on={reminders.eveningEnabled}
            onToggle={() => updateReminders({ eveningEnabled: !reminders.eveningEnabled })}
          />
          {reminders.eveningEnabled && (
            <TimeField
              label="Время вечером"
              value={reminders.eveningTime}
              onChange={(eveningTime) => updateReminders({ eveningTime })}
            />
          )}
          <div className="my-3 h-px bg-line" />
          <ToggleRow
            label="Утром, на сегодня"
            on={reminders.morningEnabled}
            onToggle={() => updateReminders({ morningEnabled: !reminders.morningEnabled })}
          />
          {reminders.morningEnabled && (
            <TimeField
              label="Время утром"
              value={reminders.morningTime}
              onChange={(morningTime) => updateReminders({ morningTime })}
            />
          )}
          <div className="my-3 h-px bg-line" />
          <ToggleRow
            label="Перед уроком"
            on={reminders.beforeDueEnabled}
            onToggle={() => updateReminders({ beforeDueEnabled: !reminders.beforeDueEnabled })}
          />
          {reminders.beforeDueEnabled && (
            <div className="mt-3 grid grid-cols-4 gap-1 rounded-lg bg-paper-deep p-1">
              {BEFORE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateReminders({ beforeDueMinutes: opt.value })}
                  className={cn(
                    "h-10 rounded-md text-xs font-medium transition-[background-color,color] duration-150 ease-out",
                    reminders.beforeDueMinutes === opt.value
                      ? "bg-sheet text-ink shadow-[var(--shadow-sheet)]"
                      : "text-muted",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {perm !== "granted" && (
          <Button variant="secondary" className="w-full" onClick={() => void enableAlerts()}>
            <Bell />
            {isNativeApp() ? "Разрешить уведомления" : "Включить уведомления"}
          </Button>
        )}

        <Button
          variant="outline"
          className="w-full"
          onClick={() => onTest(previewReminder(tasks, subjects))}
        >
          Показать, как это выглядит
        </Button>

        {upcoming.length > 0 && (
          <ul className="flex flex-col gap-2">
            {upcoming.slice(0, 4).map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-3 rounded-lg bg-paper-deep px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{item.title}</p>
                  <p className="truncate text-xs text-muted">{item.body}</p>
                </div>
                <p className="shrink-0 text-xs font-medium text-accent">{formatSoon(item.at)}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-lg font-medium tracking-tight">Установка</h2>
        <Button className="w-full" onClick={onInstall}>
          <Download />
          Скачать Дневник.apk
        </Button>
        <p className="text-sm leading-relaxed text-muted">
          Виджеты появляются только после установки на телефон. Напоминания работают и здесь, если разрешить
          уведомления.
        </p>
        <button
          type="button"
          onClick={onInstall}
          className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-accent"
        >
          <Smartphone className="size-4" />
          Как установить
        </button>
      </section>
    </div>
  );
}

function ToggleRow({
  label,
  on,
  onToggle,
}: {
  label: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className="flex min-h-11 w-full items-center justify-between gap-3"
    >
      <span className="text-sm font-medium text-ink">{label}</span>
      <span
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition-colors duration-150 ease-out",
          on ? "bg-accent" : "bg-paper-deep",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-6 rounded-full bg-sheet shadow-[var(--shadow-sheet)] transition-[left] duration-150 ease-out",
            on ? "left-5" : "left-0.5",
          )}
        />
      </span>
    </button>
  );
}

function TimeField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="mt-2 flex items-center justify-between gap-3">
      <Label htmlFor={label}>{label}</Label>
      <Input
        id={label}
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-32"
      />
    </div>
  );
}

export { MoreView };