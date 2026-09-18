type StateStorage = {
  getItem: (name: string) => string | null;
  setItem: (name: string, value: string) => void;
  removeItem: (name: string) => void;
};

type NativeBridge = {
  getPlanner?: () => string;
  setPlanner?: (json: string) => void;
};

const STORE_KEY = "dnevnik-planner-v1";
const memory = new Map<string, string>();

const memoryStorage: StateStorage = {
  getItem: (name) => memory.get(name) ?? null,
  setItem: (name, value) => {
    memory.set(name, value);
  },
  removeItem: (name) => {
    memory.delete(name);
  },
};

function apkWindow(): Window & {
  DnevnikNative?: NativeBridge;
  __DNEVNIK_NATIVE__?: boolean;
  __DNEVNIK_BOOTSTRAP__?: unknown;
} {
  return window as Window & {
    DnevnikNative?: NativeBridge;
    __DNEVNIK_NATIVE__?: boolean;
    __DNEVNIK_BOOTSTRAP__?: unknown;
  };
}

function isApk(): boolean {
  if (typeof window === "undefined") return false;
  const w = apkWindow();
  return Boolean(w.__DNEVNIK_NATIVE__ || w.DnevnikNative);
}

function looksLikePlanner(value: string | null | undefined): value is string {
  return Boolean(value && value.includes('"state"') && value.includes("subjects"));
}

function asPersistString(value: unknown): string | null {
  if (value == null || value === false) return null;
  if (typeof value === "string") return looksLikePlanner(value) ? value : null;
  try {
    const encoded = JSON.stringify(value);
    return looksLikePlanner(encoded) ? encoded : null;
  } catch {
    return null;
  }
}

function bootstrapGet(): string | null {
  if (typeof window === "undefined") return null;
  return asPersistString(apkWindow().__DNEVNIK_BOOTSTRAP__);
}

function nativeGet(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return asPersistString(apkWindow().DnevnikNative?.getPlanner?.());
  } catch {
    return null;
  }
}

function nativeSet(value: string): void {
  if (typeof window === "undefined") return;
  try {
    apkWindow().DnevnikNative?.setPlanner?.(value);
  } catch {
    // WebView bridge may be absent
  }
  if (!isApk()) return;
  try {
    window.prompt("__DNEVNIK_SAVE__", value);
  } catch {
    // ChromeClient intercepts this on the phone
  }
}

function lsGet(name: string): string | null {
  try {
    return localStorage.getItem(name);
  } catch {
    return null;
  }
}

function lsSet(name: string, value: string): void {
  try {
    localStorage.setItem(name, value);
  } catch {
    // iframe / file:// may reject
  }
}

function lsRemove(name: string): void {
  try {
    localStorage.removeItem(name);
  } catch {
    // ignore
  }
}

export function plannerStateStorage(): StateStorage {
  if (typeof window === "undefined") return memoryStorage;
  return {
    getItem: (name) =>
      nativeGet() ?? bootstrapGet() ?? lsGet(name) ?? memory.get(name) ?? null,
    setItem: (name, value) => {
      nativeSet(value);
      lsSet(name, value);
      memory.set(name, value);
    },
    removeItem: (name) => {
      nativeSet("");
      lsRemove(name);
      memory.delete(name);
    },
  };
}

export function flushPlannerToDevice(): void {
  if (typeof window === "undefined") return;
  const value =
    memory.get(STORE_KEY) ?? lsGet(STORE_KEY) ?? bootstrapGet() ?? nativeGet();
  if (looksLikePlanner(value)) nativeSet(value);
}