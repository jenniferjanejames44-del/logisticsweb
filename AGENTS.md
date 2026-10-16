# Architecture rules

- Initialize browser storage and missing UUID compatibility before dynamically importing the app; generated clients and form modules must not execute before restricted-browser safeguards are installed.
- Keep native persistent storage when available and fall back to in-memory storage when blocked or full, so privacy settings do not prevent rendering without changing authentication or backend rules.
- Load every page except the homepage with lazyPage (React.lazy plus one-time reload on stale files) so phones never download the large location data or admin code on first visit.
- Bundle only countries and states; serve cities as per-country files under public/geo/cities (regenerate with scripts/build-geo-data.mjs) and load them on demand, because the full world city list froze and crashed iPhones.
- Never let on-screen price previews throw during render or effects; catch pricing errors and show a message, since one thrown error replaces the whole page with the error screen.
- The page error screen resets on navigation and patches DOM removeChild/insertBefore at startup, so browser page-translation cannot crash React.
- Quotation emails save the current form before queueing and use local shared CORS headers; this avoids stale recipients/documents and unsupported SDK subpath imports.
