import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

/**
 * Client-side failsafe: if the user lands on a lovable.app domain with
 * auth parameters (token_hash, type, etc.), redirect them to the custom
 * domain so the auth flow completes on raclogisticltd.com.
 */
(function enforceDomainRedirect() {
  const { hostname, pathname, search, hash } = window.location;
  if (hostname.includes("lovable.app") || hostname.includes("lovable.dev")) {
    // Only redirect if this looks like an auth callback (has token_hash or type param)
    const params = new URLSearchParams(search);
    const hashParams = new URLSearchParams(hash.replace(/^#/, ""));
    const isAuthCallback =
      params.has("token_hash") ||
      params.has("type") ||
      hashParams.has("token_hash") ||
      hashParams.has("type") ||
      pathname.startsWith("/auth/confirm") ||
      pathname.startsWith("/reset-password");

    if (isAuthCallback) {
      const target = `https://www.raclogisticltd.com${pathname}${search}${hash}`;
      window.location.replace(target);
      return; // Stop rendering — we're redirecting
    }
  }
})();

createRoot(document.getElementById("root")!).render(<App />);
