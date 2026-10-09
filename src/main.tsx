import { createRoot } from "react-dom/client";
import { installBrowserCompatibility } from "./lib/browserCompatibility";
import "./index.css";

installBrowserCompatibility();

/**
 * Restore SPA routes redirected by public/404.html.
 * Some hosts serve /dashboard as /?p=/dashboard after refresh; React Router
 * must see the original path before the app mounts.
 */
(function restoreSpaFallbackPath() {
  const url = new URL(window.location.href);
  const redirectedPath = url.searchParams.get("p");

  if (!redirectedPath) return;

  const decodedPath = decodeURIComponent(redirectedPath).replace(/^\/?(?:%2F|2F|252F)/i, "/");
  const restoredQuery = url.searchParams.get("q")?.replace(/~and~/g, "&") ?? "";
  const cleanPath = decodedPath.startsWith("/") ? decodedPath : `/${decodedPath}`;
  const restoredUrl = `${cleanPath}${restoredQuery ? `?${restoredQuery}` : ""}${window.location.hash}`;

  window.history.replaceState(null, "", restoredUrl);
})();

/**
 * Client-side failsafe: if the user lands on any non-RAC domain with
 * auth parameters or auth callback paths, immediately move the flow to
 * raclogisticltd.com while preserving the full URL payload.
 */
(function enforceDomainRedirect() {
  const { hostname, pathname, search, hash } = window.location;
  const params = new URLSearchParams(search);
  const hashParams = new URLSearchParams(hash.replace(/^#/, ""));
  const isTrustedDomain = ["raclogisticltd.com", "www.raclogisticltd.com", "localhost", "127.0.0.1"].includes(hostname);
  const hasAuthPayload = ["token_hash", "type", "access_token", "refresh_token", "code"].some(
    (key) => params.has(key) || hashParams.has(key),
  );
  const isAuthPath =
    pathname.startsWith("/auth/confirm") ||
    pathname.startsWith("/auth/callback") ||
    pathname.startsWith("/reset-password");

  if (!isTrustedDomain && (hasAuthPayload || isAuthPath)) {
    const target = `https://www.raclogisticltd.com${pathname}${search}${hash}`;
    window.location.replace(target);
    return;
  }
})();

// Import only after storage is safe: the generated auth client reads it on import.
async function mountApp() {
  const root = document.getElementById("root");
  if (!root) return;
  try {
    const { default: App } = await import("./App.tsx");
    createRoot(root).render(<App />);
  } catch (error) {
    const helpers = await import("./lib/lazyPage").catch(() => null);
    if (helpers?.isChunkLoadError(error) && helpers.reloadOnceForNewVersion()) return;
    console.error("[App] failed to start", error);
    root.innerHTML =
      '<div style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;font-family:DM Sans,sans-serif;text-align:center;padding:24px">' +
      '<h1 style="font-size:22px;color:#061043">RAC Logistics could not load</h1>' +
      '<p style="color:#555">Please check your connection and try again.</p>' +
      '<button onclick="location.reload()" style="height:48px;padding:0 24px;border:0;border-radius:8px;background:#DF5101;color:#fff;font-weight:600">Reload page</button></div>';
  }
}

void mountApp();
