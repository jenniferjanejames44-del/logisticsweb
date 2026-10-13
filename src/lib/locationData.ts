// Dependent Country → State → City/LGA data for every address form.
// Countries and states are small and bundled. Cities are stored per country
// in /geo/cities/<ISO>.json and downloaded only when a state is chosen, so
// phones (especially iPhones) never download or parse the 8 MB world city list.
// Nigeria uses the official 36 states + FCT / 774 LGAs source.
import { all as allNigeriaStates } from "nigerian-states-and-lgas";
import countryRows from "./geo/countries.json";
import stateRows from "./geo/states.json";

export interface LocationOption {
  name: string;
  isoCode: string;
}

const normalize = (value: unknown) => String(value ?? "").trim().toLowerCase();
const isNigeria = (countryName: string) => normalize(countryName) === "nigeria";

let _nigeriaRows: { state: string; lookupState: string; lgas: string[] }[] | null = null;
const nigeriaStateRows = () => {
  if (!_nigeriaRows) {
    _nigeriaRows = allNigeriaStates().map(({ state, lgas }) => ({
      state: state === "Kastina" ? "Katsina" : state === "Federal Capital Territory" ? "FCT - Abuja" : state,
      lookupState: state,
      lgas,
    }));
  }
  return _nigeriaRows;
};

let _countriesCache: LocationOption[] | null = null;
export const getCountries = (): LocationOption[] => {
  if (!_countriesCache) {
    _countriesCache = (countryRows as unknown as [string, string][]).map(([isoCode, name]) => ({ name, isoCode }));
  }
  return _countriesCache;
};

export const findCountryByName = (name: string): LocationOption | null => {
  if (!name) return null;
  const lower = normalize(name);
  return getCountries().find((c) => normalize(c.name) === lower) || null;
};

const statesCache = new Map<string, LocationOption[]>();
export const getStates = (countryName: string): LocationOption[] => {
  if (!countryName) return [];
  const key = normalize(countryName);
  const cached = statesCache.get(key);
  if (cached) return cached;

  let result: LocationOption[] = [];
  if (isNigeria(countryName)) {
    result = nigeriaStateRows()
      .map((row) => ({ name: row.state, isoCode: row.lookupState }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } else {
    const c = findCountryByName(countryName);
    const rows = c ? ((stateRows as unknown as Record<string, [string, string][]>)[c.isoCode] || []) : [];
    result = rows.map(([isoCode, name]) => ({ name, isoCode }));
  }
  statesCache.set(key, result);
  return result;
};

export const findStateByName = (countryName: string, stateName: string): LocationOption | null => {
  if (!stateName) return null;
  const lower = normalize(stateName);
  return getStates(countryName).find((s) => normalize(s.name) === lower) || null;
};

const cityFileCache = new Map<string, Promise<Record<string, string[]>>>();
const loadCityFile = (isoCode: string) => {
  let pending = cityFileCache.get(isoCode);
  if (!pending) {
    pending = fetch(`/geo/cities/${isoCode}.json`)
      .then((res) => (res.ok ? res.json() : {}))
      .catch(() => ({}));
    // Allow a retry later if the network failed this time.
    pending.then((data) => { if (!data || !Object.keys(data).length) cityFileCache.delete(isoCode); });
    cityFileCache.set(isoCode, pending);
  }
  return pending;
};

/** Cities/LGAs for a state. Never throws; returns [] when unavailable (users can still type). */
export const loadCities = async (countryName: string, stateName: string): Promise<string[]> => {
  try {
    if (!countryName || !stateName) return [];
    if (isNigeria(countryName)) {
      const selected = findStateByName(countryName, stateName);
      const row = nigeriaStateRows().find((r) => r.lookupState === selected?.isoCode);
      return row ? [...row.lgas].sort((a, b) => a.localeCompare(b)) : [];
    }
    const c = findCountryByName(countryName);
    const s = findStateByName(countryName, stateName);
    if (!c || !s) return [];
    const data = await loadCityFile(c.isoCode);
    return Array.isArray(data?.[s.isoCode]) ? data[s.isoCode] : [];
  } catch {
    return [];
  }
};
