// Wraps location datasets so all forms can render dependent Country → State →
// City/LGA dropdowns without requiring a paid API key. Nigeria is overridden
// with a complete 36 states + FCT / 774 LGAs source because the generic
// country-state-city package stores cities, not official LGAs.
import { Country, State, City } from "country-state-city";
import { all as allNigeriaStates } from "nigerian-states-and-lgas";

export interface LocationOption {
  name: string;
  isoCode: string;
}

const normalize = (value: string) => value.trim().toLowerCase();
const isNigeria = (countryName: string) => normalize(countryName) === "nigeria";

const nigeriaStateRows = () =>
  allNigeriaStates().map(({ state, lgas }) => ({
    state: state === "Kastina" ? "Katsina" : state === "Federal Capital Territory" ? "FCT - Abuja" : state,
    lookupState: state,
    lgas,
  }));

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
  const lower = normalize(name);
  return getCountries().find((c) => normalize(c.name) === lower) || null;
};

export const getStates = (countryName: string): LocationOption[] => {
  if (isNigeria(countryName)) {
    return nigeriaStateRows()
      .map((row) => ({ name: row.state, isoCode: row.lookupState }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

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
  const lower = normalize(stateName);
  return getStates(countryName).find((s) => normalize(s.name) === lower) || null;
};

export const getCities = (countryName: string, stateName: string): string[] => {
  if (isNigeria(countryName)) {
    const selected = findStateByName(countryName, stateName);
    const row = nigeriaStateRows().find((r) => r.lookupState === selected?.isoCode);
    return row ? [...row.lgas].sort((a, b) => a.localeCompare(b)) : [];
  }

  const c = findCountryByName(countryName);
  const s = findStateByName(countryName, stateName);
  if (!c || !s) return [];
  return City.getCitiesOfState(c.isoCode, s.isoCode)
    .map((ci) => ci.name)
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .sort((a, b) => a.localeCompare(b));
};