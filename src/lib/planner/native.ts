import type { NativeSnapshot } from "./reminders";

type DnevnikNative = {
  sync: (json: string) => void;
  requestNotifications: () => void;
  getPlanner?: () => string;
  setPlanner?: (json: string) => void;
};

function getNative(): DnevnikNative | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as Window & { DnevnikNative?: DnevnikNative }).DnevnikNative;
}

export function isNativeApp(): boolean {
  return Boolean(getNative());
}

export function pushNativeSnapshot(snapshot: NativeSnapshot): void {
  const native = getNative();
  if (!native?.sync) return;
  try {
    native.sync(JSON.stringify(snapshot));
  } catch {
    // WebView bridge may be absent in preview
  }
}

export function requestNativeNotifications(): void {
  const native = getNative();
  if (!native?.requestNotifications) return;
  try {
    native.requestNotifications();
  } catch {
    // ignore
  }
}