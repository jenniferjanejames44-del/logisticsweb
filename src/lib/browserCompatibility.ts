/** Keep browser privacy settings from crashing the generated client at startup. */
export function createResilientStorage(readStorage: () => Storage): Storage {
  const memory = new Map<string, string>();
  let persistent: Storage | undefined;
  try {
    const candidate = readStorage();
    const probe = `rac-storage-check-${Date.now()}`;
    candidate.setItem(probe, probe);
    candidate.removeItem(probe);
    persistent = candidate;
  } catch {
    // Private/restricted browsers can continue with tab-local storage.
  }

  return {
    get length() {
      try { if (persistent) return persistent.length; } catch { persistent = undefined; }
      return memory.size;
    },
    clear() {
      memory.clear();
      try { persistent?.clear(); } catch { persistent = undefined; }
    },
    getItem(key) {
      try {
        if (persistent) {
          const value = persistent.getItem(key);
          if (value !== null) memory.set(key, value);
          return value;
        }
      } catch { persistent = undefined; }
      return memory.get(key) ?? null;
    },
    key(index) {
      try { if (persistent) return persistent.key(index); } catch { persistent = undefined; }
      return Array.from(memory.keys())[index] ?? null;
    },
    removeItem(key) {
      memory.delete(key);
      try { persistent?.removeItem(key); } catch { persistent = undefined; }
    },
    setItem(key, value) {
      memory.set(String(key), String(value));
      try { persistent?.setItem(key, value); } catch { persistent = undefined; }
    },
  };
}

export function installBrowserCompatibility() {
  for (const name of ["localStorage", "sessionStorage"] as const) {
    const storage = createResilientStorage(() => window[name]);
    Object.defineProperty(window, name, { configurable: true, get: () => storage });
  }

  // Safari before 15.4 lacks randomUUID; these IDs identify form rows only.
  if (window.crypto && typeof window.crypto.randomUUID !== "function") {
    Object.defineProperty(window.crypto, "randomUUID", {
      configurable: true,
      value: () => {
        const bytes = window.crypto.getRandomValues(new Uint8Array(16));
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;
        const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));
        return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
      },
    });
  }
}