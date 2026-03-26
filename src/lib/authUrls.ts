export const AUTH_SITE_URL = "https://www.raclogisticltd.com";

const AUTH_SITE_HOSTS = new Set(["raclogisticltd.com", "www.raclogisticltd.com"]);

export const isSafeAuthHost = (hostname: string) => AUTH_SITE_HOSTS.has(hostname.toLowerCase());

export const buildAuthRedirectUrl = (
  path: string,
  queryParams?: Record<string, string | null | undefined>,
) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(normalizedPath, AUTH_SITE_URL);

  Object.entries(queryParams ?? {}).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
};

export const buildAuthCallbackUrl = (nextPath: string) =>
  buildAuthRedirectUrl("/auth/callback", { next: nextPath });

export const getSafeAuthReturnPath = (target: string | null, fallbackPath: string) => {
  if (!target) {
    return fallbackPath;
  }

  try {
    const url = new URL(target, AUTH_SITE_URL);
    if (!isSafeAuthHost(url.hostname)) {
      return fallbackPath;
    }

    return `${url.pathname}${url.search}${url.hash}` || fallbackPath;
  } catch {
    return target.startsWith("/") ? target : fallbackPath;
  }
};