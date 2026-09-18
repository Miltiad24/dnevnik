import { useEffect, useMemo, useState, type ReactNode } from "react";
import { BookOpen, CalendarDays, Library, Plus, SlidersHorizontal, Smartphone } from "lucide-react";
import { MoreView } from "@/components/planner/more-view";
import { ProgressRing } from "@/components/planner/progress-ring";
import { ReminderBanner } from "@/components/planner/reminder-banner";
import { SubjectSheet } from "@/components/planner/subject-sheet";
import { SubjectsView } from "@/components/planner/subjects-view";
import { TaskSheet } from "@/components/planner/task-sheet";
import { TodayView } from "@/components/planner/today-view";
import { WeekView } from "@/components/planner/week-view";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { pushNativeSnapshot } from "@/lib/planner/native";
import {
  buildSnapshot,
  collectDue,
  showWebNotification,
  upcomingReminders,
  type DueReminder,
} from "@/lib/planner/reminders";
import { getWeekDays, isPastDate, todayISO, toISODate } from "@/lib/planner/dates";
import { usePlannerStore } from "@/lib/planner/store";
import type { PlannerTab, Task } from "@/lib/planner/types";
import { cn } from "@/lib/utils";

type TaskEditor = {
  open: boolean;
  id?: string;
  date?: string;
  subjectId?: string;
};

type SubjectEditor = {
  open: boolean;
  id?: string;
};

export function PlannerApp() {
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<PlannerTab>("today");
  const [taskEditor, setTaskEditor] = useState<TaskEditor>({ open: false });
  const [subjectEditor, setSubjectEditor] = useState<SubjectEditor>({ open: false });
  const [installOpen, setInstallOpen] = useState(false);
  const [installEvent, setInstallEvent] = useState<{ prompt: () => Promise<void> } | null>(null);
  const [banner, setBanner] = useState<DueReminder | null>(null);

  const subjects = usePlannerStore((s) => s.subjects);
  const tasks = usePlannerStore((s) => s.tasks);
  const reminders = usePlannerStore((s) => s.reminders);
  const addTask = usePlannerStore((s) => s.addTask);
  const updateTask = usePlannerStore((s) => s.updateTask);
  const toggleTask = usePlannerStore((s) => s.toggleTask);
  const deleteTask = usePlannerStore((s) => s.deleteTask);
  const clearDone = usePlannerStore((s) => s.clearDone);
  const addSubject = usePlannerStore((s) => s.addSubject);
  const updateSubject = usePlannerStore((s) => s.updateSubject);
  const deleteSubject = usePlannerStore((s) => s.deleteSubject);

  useEffect(() => {
    let cancelled = false;
    void Promise.resolve(usePlannerStore.persist.rehydrate()).then(() => {
      if (cancelled) return;
      usePlannerStore.getState().ensureSeed();
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function onPrompt(event: Event) {
      event.preventDefault();
      const promptEvent = event as Event & { prompt: () => Promise<void> };
      setInstallEvent(promptEvent);
    }
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  useEffect(() => {
    if (!ready) return;

    function tick() {
      const state = usePlannerStore.getState();
      const snapshot = buildSnapshot(state.tasks, state.subjects, state.reminders);
      pushNativeSnapshot(snapshot);
      const due = collectDue(state.tasks, state.subjects, state.reminders, state.fired);
      if (!due) return;
      state.markFired(due);
      setBanner(due);
      showWebNotification(due);
    }

    tick();
    const id = window.setInterval(tick, 20000);
    function onVis() {
      if (document.visibilityState === "visible") tick();
    }
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [ready, tasks, reminders]);

  async function installOnPhone() {
    if (installEvent) {
      await installEvent.prompt();
      setInstallEvent(null);
      return;
    }
    setInstallOpen(true);
  }

  const stats = useMemo(() => computeStats(tasks), [tasks]);
  const snapshot = useMemo(
    () => buildSnapshot(tasks, subjects, reminders),
    [tasks, subjects, reminders],
  );
  const upcoming = useMemo(
    () => upcomingReminders(tasks, subjects, reminders),
    [tasks, subjects, reminders],
  );
  const editingTask = tasks.find((t) => t.id === taskEditor.id);
  const editingSubject = subjects.find((s) => s.id === subjectEditor.id);

  function openNewTask(date?: string, subjectId?: string) {
    if (subjects.length === 0) {
      setSubjectEditor({ open: true });
      return;
    }
    setTaskEditor({ open: true, date, subjectId });
  }

  function showTest(reminder: DueReminder) {
    setBanner(reminder);
    showWebNotification(reminder);
  }

  if (!ready) {
    return <PlannerSkeleton />;
  }

  return (
    <div className="min-h-dvh bg-paper-deep text-ink">
      <div className="relative mx-auto flex min-h-dvh max-w-lg flex-col bg-paper">
        <div
          className="pointer-events-none absolute inset-y-0 left-5 z-0 w-px bg-danger/20"
          aria-hidden="true"
        />

        {banner && (
          <ReminderBanner
            reminder={banner}
            onOpen={() => {
              setBanner(null);
              setTab("today");
            }}
            onDismiss={() => setBanner(null)}
          />
        )}

        <header className="flex items-center justify-between gap-3 px-5 pb-2 pt-safe">
          <div className="min-w-0 pl-3">
            <p className="font-display text-lg font-medium tracking-tight">Дневник</p>
            <p className="text-sm text-muted">Домашние задания</p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Напоминания и виджеты"
              aria-pressed={tab === "more"}
              onClick={() => setTab(tab === "more" ? "today" : "more")}
            >
              <SlidersHorizontal className={cn("size-5", tab === "more" && "text-accent")} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Установить на телефон"
              onClick={() => void installOnPhone()}
            >
              <Smartphone className="size-5" />
            </Button>
            <ProgressRing value={stats.weekDone} total={stats.weekTotal} />
          </div>
        </header>

        {tab !== "more" && (
          <div className="grid grid-cols-3 gap-2 px-5 pb-4">
            <StatChip label="Сегодня" value={stats.todayLeft} />
            <StatChip label="Сделано" value={stats.weekDone} />
            <StatChip label="Просрочка" value={stats.overdue} alert={stats.overdue > 0} />
          </div>
        )}

        <main key={tab} className="min-h-0 flex-1 overflow-y-auto px-5 pb-36">
          {tab === "today" && (
            <TodayView
              tasks={tasks}
              subjects={subjects}
              onToggle={toggleTask}
              onOpen={(id) => setTaskEditor({ open: true, id })}
              onAdd={() => openNewTask()}
              onClearDone={clearDone}
            />
          )}
          {tab === "week" && (
            <WeekView
              tasks={tasks}
              subjects={subjects}
              onToggle={toggleTask}
              onOpen={(id) => setTaskEditor({ open: true, id })}
              onAdd={(date) => openNewTask(date)}
            />
          )}
          {tab === "subjects" && (
            <SubjectsView
              subjects={subjects}
              tasks={tasks}
              onOpen={(id) => setSubjectEditor({ open: true, id })}
              onAdd={() => setSubjectEditor({ open: true })}
            />
          )}
          {tab === "more" && (
            <MoreView
              tasks={tasks}
              subjects={subjects}
              snapshot={snapshot}
              upcoming={upcoming}
              onTest={showTest}
              onInstall={() => void installOnPhone()}
            />
          )}
        </main>

        {tab !== "subjects" && tab !== "more" && (
          <Button
            size="fab"
            className="fab-dock"
            aria-label="Новое задание"
            onClick={() => openNewTask()}
          >
            <Plus />
          </Button>
        )}

        <nav
          className="absolute inset-x-0 bottom-0 z-20 border-t border-line bg-paper pb-nav-safe pt-1"
          aria-label="Разделы"
        >
          <div className="grid grid-cols-3">
            <NavBtn
              active={tab === "today"}
              icon={<BookOpen />}
              label="Сегодня"
              onClick={() => setTab("today")}
            />
            <NavBtn
              active={tab === "week"}
              icon={<CalendarDays />}
              label="Неделя"
              onClick={() => setTab("week")}
            />
            <NavBtn
              active={tab === "subjects"}
              icon={<Library />}
              label="Предметы"
              onClick={() => setTab("subjects")}
            />
          </div>
        </nav>
      </div>

      <TaskSheet
        open={taskEditor.open}
        onOpenChange={(open) => setTaskEditor((s) => ({ ...s, open }))}
        subjects={subjects}
        task={editingTask}
        presetDate={taskEditor.date}
        presetSubjectId={taskEditor.subjectId}
        onSave={(data, id) => {
          if (id) updateTask(id, data);
          else addTask(data);
        }}
        onDelete={deleteTask}
      />

      <SubjectSheet
        open={subjectEditor.open}
        onOpenChange={(open) => setSubjectEditor((s) => ({ ...s, open }))}
        subject={editingSubject}
        onSave={(data, id) => {
          if (id) updateSubject(id, data);
          else addSubject(data);
        }}
        onDelete={deleteSubject}
      />

      <Drawer open={installOpen} onOpenChange={setInstallOpen}>
        <DrawerContent title="Установка на Android">
          <Button asChild className="w-full">
            <a href="/dnevnik.apk" download="Dnevnik.apk">
              Скачать Дневник.apk
            </a>
          </Button>
          <ol className="mt-5 flex list-decimal flex-col gap-3 pl-5 text-sm leading-relaxed text-ink">
            <li>Скачай файл и открой его на телефоне.</li>
            <li>Если Android спросит — разреши установку из этого приложения (Файлы или Chrome).</li>
            <li>Нажми «Установить». Иконка «Дневник» появится на экране.</li>
            <li>Виджеты: долгое нажатие на рабочем столе → «Виджеты» → Дневник.</li>
          </ol>
          <p className="mt-5 text-sm text-muted">
            Это подписанный установочный файл приложения, не из Play Маркета.
            Данные остаются на телефоне. Напоминания приходят, даже когда дневник закрыт.
          </p>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

function computeStats(tasks: Task[]) {
  const today = todayISO();
  const week = getWeekDays();
  const start = toISODate(week[0]!);
  const end = toISODate(week[6]!);
  const weekTasks = tasks.filter((t) => t.dueDate >= start && t.dueDate <= end);
  return {
    todayLeft: tasks.filter((t) => t.status === "todo" && t.dueDate === today).length,
    overdue: tasks.filter((t) => t.status === "todo" && isPastDate(t.dueDate)).length,
    weekDone: weekTasks.filter((t) => t.status === "done").length,
    weekTotal: weekTasks.length,
  };
}

function StatChip({
  label,
  value,
  alert,
}: {
  label: string;
  value: number;
  alert?: boolean;
}) {
  return (
    <div className="rounded-lg bg-sheet px-3 py-2 shadow-[var(--shadow-sheet)]">
      <p className="text-xs font-medium text-muted">{label}</p>
      <p
        className={cn(
          "font-display text-xl font-medium tabular-nums leading-tight",
          alert ? "text-danger" : "text-ink",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function NavBtn({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-14 flex-col items-center justify-center gap-1 text-xs font-medium",
        "transition-colors duration-150 ease-out",
        active ? "text-accent" : "text-subtle",
      )}
    >
      <span className="[&_svg]:size-5">{icon}</span>
      {label}
    </button>
  );
}

function PlannerSkeleton() {
  return (
    <div className="min-h-dvh bg-paper text-ink">
      <div className="mx-auto flex min-h-dvh max-w-lg flex-col px-5 pt-safe">
        <div className="h-7 w-32 rounded-md bg-paper-deep" />
        <div className="mt-2 h-4 w-24 rounded-md bg-paper-deep" />
        <div className="mt-6 grid grid-cols-3 gap-2">
          <div className="h-16 rounded-lg bg-paper-deep" />
          <div className="h-16 rounded-lg bg-paper-deep" />
          <div className="h-16 rounded-lg bg-paper-deep" />
        </div>
        <div className="mt-8 h-8 w-40 rounded-md bg-paper-deep" />
        <div className="mt-4 h-20 rounded-xl bg-paper-deep" />
        <div className="mt-2 h-20 rounded-xl bg-paper-deep" />
      </div>
    </div>
  );
}