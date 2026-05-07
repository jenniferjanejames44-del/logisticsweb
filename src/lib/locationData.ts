// Wraps the offline country-state-city dataset so all forms can render
// dependent Country → State → City dropdowns without hitting any API.
// All lookups are by *display name* (which is what we already persist
// to Supabase), so existing data and admin views keep working unchanged.
import { Country, State, City } from "country-state-city";

export interface LocationOption {
  name: string;
  isoCode: string;
}

const allCountries = (): LocationOption[] =>
  Country.getAllCountries()
    .map((c) => ({ name: c.name, isoCode: c.isoCode }))
    .sort((a, b) => a.name.localeCompare(b.name));

let _countriesCache: LocationOption[] | null = null;
export const getCountries = (): LocationOption[] => {
  if (!_countriesCache) _countriesCache = allCountries();
  return _countriesCache;
};

export const findCountryByName = (name: string): LocationOption | null => {
  if (!name) return null;
  const lower = name.trim().toLowerCase();
  return getCountries().find((c) => c.name.toLowerCase() === lower) || null;
};

export const getStates = (countryName: string): LocationOption[] => {
  const c = findCountryByName(countryName);
  if (!c) return [];
  return State.getStatesOfCountry(c.isoCode)
    .map((s) => ({ name: s.name, isoCode: s.isoCode }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

export const findStateByName = (
  countryName: string,
  stateName: string,
): LocationOption | null => {
  if (!stateName) return null;
  const lower = stateName.trim().toLowerCase();
  return getStates(countryName).find((s) => s.name.toLowerCase() === lower) || null;
};

export const getCities = (countryName: string, stateName: string): string[] => {
  const c = findCountryByName(countryName);
  const s = findStateByName(countryName, stateName);
  if (!c || !s) return [];
  return City.getCitiesOfState(c.isoCode, s.isoCode)
    .map((ci) => ci.name)
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .sort((a, b) => a.localeCompare(b));
};