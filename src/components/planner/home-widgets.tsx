import type { WidgetItem } from "@/lib/planner/reminders";
import { cn } from "@/lib/utils";

type HomeWidgetsProps = {
  todayLeft: number;
  overdue: number;
  headline: string;
  subhead: string;
  items: WidgetItem[];
};

function HomeWidgets({ todayLeft, overdue, headline, subhead, items }: HomeWidgetsProps) {
  return (
    <div className="widget-home rounded-2xl p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-accent-fg/70">Рабочий стол</p>
      <div className="mt-3 flex items-stretch gap-3">
        <div className="w-28 shrink-0">
          <SmallWidget todayLeft={todayLeft} overdue={overdue} subhead={subhead} />
        </div>
        <div className="min-w-0 flex-1">
          <ListWidget headline={headline} items={items} compact />
        </div>
      </div>
      <div className="mt-3">
        <ListWidget headline={headline} items={items} />
      </div>
    </div>
  );
}

function SmallWidget({
  todayLeft,
  overdue,
  subhead,
}: {
  todayLeft: number;
  overdue: number;
  subhead: string;
}) {
  return (
    <div className="flex h-full min-h-32 flex-col justify-between rounded-2xl bg-sheet p-3 shadow-[var(--shadow-sheet)]">
      <p className="text-xs font-medium text-muted">Сегодня</p>
      <p className="font-display text-4xl font-medium leading-none tabular-nums text-ink">{todayLeft}</p>
      <p className={cn("text-xs leading-snug", overdue > 0 ? "text-danger" : "text-muted")}>{subhead}</p>
    </div>
  );
}

function ListWidget({
  headline,
  items,
  compact,
}: {
  headline: string;
  items: WidgetItem[];
  compact?: boolean;
}) {
  const shown = items.slice(0, compact ? 2 : 3);
  return (
    <div className="flex min-h-32 flex-col rounded-2xl bg-sheet p-3 shadow-[var(--shadow-sheet)]">
      <p className="text-xs font-medium text-muted">Дневник · {headline}</p>
      {shown.length === 0 ? (
        <p className="mt-3 text-sm text-muted">На сегодня пусто</p>
      ) : (
        <ul className="mt-2 flex flex-col gap-2">
          {shown.map((item) => (
            <li key={item.title} className="flex gap-2">
              <span className="mt-0.5 h-8 w-1 shrink-0 rounded-full" style={{ background: item.color }} />
              <div className="min-w-0">
                <p className={cn("truncate text-sm font-medium", item.urgent ? "text-danger" : "text-ink")}>
                  {item.title}
                </p>
                <p className="truncate text-xs text-muted">{item.meta}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export { HomeWidgets, ListWidget, SmallWidget };