import { describe, expect, it, vi } from "vitest";
import { createResilientStorage, installBrowserCompatibility } from "./browserCompatibility";

describe("restricted browser compatibility", () => {
  it("keeps storage usable when Safari blocks access", () => {
    const storage = createResilientStorage(() => { throw new DOMException("Blocked", "SecurityError"); });
    storage.setItem("preference", "light");
    expect(storage.getItem("preference")).toBe("light");
    expect(storage.length).toBe(1);
    storage.removeItem("preference");
    expect(storage.getItem("preference")).toBeNull();
  });

  it("survives write quota failures after startup", () => {
    const native = window.localStorage;
    const storage = createResilientStorage(() => native);
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("Full", "QuotaExceededError"); });
    storage.setItem("draft", "saved");
    expect(storage.getItem("draft")).toBe("saved");
    spy.mockRestore();
  });

  it("preserves persisted values in normal browsers", () => {
    window.localStorage.setItem("rac-test", "existing");
    const storage = createResilientStorage(() => window.localStorage);
    expect(storage.getItem("rac-test")).toBe("existing");
    storage.setItem("rac-test", "updated");
    expect(window.localStorage.getItem("rac-test")).toBe("updated");
    storage.removeItem("rac-test");
  });

  it("provides distinct UUIDs when Safari lacks randomUUID", () => {
    const descriptor = Object.getOwnPropertyDescriptor(window.crypto, "randomUUID");
    Object.defineProperty(window.crypto, "randomUUID", { configurable: true, value: undefined });
    const local = Object.getOwnPropertyDescriptor(window, "localStorage");
    const session = Object.getOwnPropertyDescriptor(window, "sessionStorage");
    try {
      installBrowserCompatibility();
      const first = window.crypto.randomUUID();
      expect(first).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
      expect(window.crypto.randomUUID()).not.toBe(first);
    } finally {
      if (descriptor) Object.defineProperty(window.crypto, "randomUUID", descriptor);
      else Reflect.deleteProperty(window.crypto, "randomUUID");
      if (local) Object.defineProperty(window, "localStorage", local);
      if (session) Object.defineProperty(window, "sessionStorage", session);
    }
  });
});