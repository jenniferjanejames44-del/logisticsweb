import React from "react";

const RELOAD_KEY = "rac-chunk-reload-at";

/** After a new deploy, old page files disappear; reload once to fetch the new version. */
export function isChunkLoadError(error: unknown) {
  const message = error instanceof Error ? `${error.name} ${error.message}` : String(error);
  return /Failed to fetch dynamically imported module|Importing a module script failed|error loading dynamically imported module|ChunkLoadError|Loading chunk/i.test(message);
}

export function reloadOnceForNewVersion() {
  try {
    const last = Number(window.sessionStorage.getItem(RELOAD_KEY) || 0);
    if (Date.now() - last < 30000) return false;
    window.sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    return false;
  }
  window.location.reload();
  return true;
}

export function lazyPage<T extends React.ComponentType<any>>(load: () => Promise<{ default: T }>) {
  return React.lazy(() =>
    load().catch((error) => {
      if (isChunkLoadError(error) && reloadOnceForNewVersion()) {
        return new Promise<{ default: T }>(() => {});
      }
      throw error;
    }),
  );
}

export const PageLoader = () => (
  <div className="flex min-h-screen items-center justify-center bg-background">
    <div className="h-9 w-9 animate-spin rounded-full border-4 border-secondary border-t-transparent" />
  </div>
);

export class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: unknown) {
    if (isChunkLoadError(error)) reloadOnceForNewVersion();
    console.error("[App] page failed to render", error);
  }
  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <h1 className="text-2xl font-bold text-foreground">Something went wrong loading this page</h1>
        <p className="max-w-md text-muted-foreground">Please check your connection and try again.</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="h-12 rounded-lg bg-secondary px-6 font-semibold text-secondary-foreground"
        >
          Reload page
        </button>
      </div>
    );
  }
}
