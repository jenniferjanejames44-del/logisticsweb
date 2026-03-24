export const AUTH_SITE_URL = "https://www.raclogisticltd.com";

export const buildAuthRedirectUrl = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return new URL(normalizedPath, AUTH_SITE_URL).toString();
};

export const getSafeAuthReturnPath = (target: string | null, fallbackPath: string) => {
  if (!target) {
    return fallbackPath;
  }

  try {
    const url = new URL(target, AUTH_SITE_URL);
    if (!["raclogisticltd.com", "www.raclogisticltd.com"].includes(url.hostname)) {
      return fallbackPath;
    }

    return `${url.pathname}${url.search}${url.hash}` || fallbackPath;
  } catch {
    return target.startsWith("/") ? target : fallbackPath;
  }
};