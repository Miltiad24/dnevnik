type StateStorage = {
  getItem: (name: string) => string | null;
  setItem: (name: string, value: string) => void;
  removeItem: (name: string) => void;
};

type NativeBridge = {
  getPlanner?: () => string;
  setPlanner?: (json: string) => void;
};

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

function native(): NativeBridge | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as Window & { DnevnikNative?: NativeBridge }).DnevnikNative;
}

function nativeGet(): string | null {
  try {
    const value = native()?.getPlanner?.();
    if (!value || value === "{}" || value === "null") return null;
    return value;
  } catch {
    return null;
  }
}

function nativeSet(value: string): void {
  try {
    native()?.setPlanner?.(value);
  } catch {
    // WebView bridge may be absent
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
    getItem: (name) => nativeGet() ?? lsGet(name) ?? memory.get(name) ?? null,
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