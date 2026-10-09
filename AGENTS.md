# Architecture rules

- Initialize browser storage and missing UUID compatibility before dynamically importing the app; generated clients and form modules must not execute before restricted-browser safeguards are installed.
- Keep native persistent storage when available and fall back to in-memory storage when blocked or full, so privacy settings do not prevent rendering without changing authentication or backend rules.