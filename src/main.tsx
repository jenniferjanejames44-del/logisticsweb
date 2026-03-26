import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

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

createRoot(document.getElementById("root")!).render(<App />);
