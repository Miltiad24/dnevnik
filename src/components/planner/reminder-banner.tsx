import { Bell, X } from "lucide-react";
import type { DueReminder } from "@/lib/planner/reminders";

type ReminderBannerProps = {
  reminder: DueReminder;
  onOpen: () => void;
  onDismiss: () => void;
};

function ReminderBanner({ reminder, onOpen, onDismiss }: ReminderBannerProps) {
  return (
    <div className="pointer-events-none absolute inset-x-3 top-safe z-30">
      <div className="pointer-events-auto flex items-center gap-2 overflow-hidden rounded-xl bg-ink py-2 pl-2 pr-1 text-sheet shadow-[var(--shadow-fab)] stagger-in">
        <button
          type="button"
          onClick={onOpen}
          className="flex min-w-0 flex-1 items-center gap-3 px-1 py-1 text-left"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-fg">
            <Bell className="size-4" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-sm font-medium tracking-tight">
              {reminder.title}
            </span>
            <span className="mt-0.5 block truncate text-xs text-sheet/70">{reminder.body}</span>
          </span>
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="flex size-11 shrink-0 items-center justify-center text-sheet/70"
          aria-label="Скрыть"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}

export { ReminderBanner };