import { useMemo } from "react";
import SearchableCountrySelect from "./SearchableCountrySelect";
import AsyncCitySelect from "./AsyncCitySelect";
import { Input } from "@/components/ui/input";
import { getCountries, getStates, getCities } from "@/lib/locationData";

interface LocationSelectorProps {
  country: string;
  state: string;
  city: string;
  onCountryChange: (v: string) => void;
  onStateChange: (v: string) => void;
  onCityChange: (v: string) => void;
  disabled?: boolean;
  countryDisabled?: boolean;
  stateLabel?: string;
  cityLabel?: string;
  errors?: { country?: string; state?: string; city?: string };
  inputClassName?: string;
}

/**
 * Dependent Country → State → City selector backed by the offline
 * country-state-city dataset. Falls back to a plain text input when no
 * states or cities are available for a selection (so users are never blocked).
 * Persists *display names* — same shape the rest of the app already stores.
 */
const LocationSelector = ({
  country,
  state,
  city,
  onCountryChange,
  onStateChange,
  onCityChange,
  disabled = false,
  countryDisabled = false,
  errors = {},
  inputClassName = "",
}: LocationSelectorProps) => {
  const countries = useMemo(() => getCountries().map((c) => c.name), []);
  const states = useMemo(() => getStates(country), [country]);
  const cities = useMemo(() => getCities(country, state), [country, state]);

  const handleCountry = (v: string) => {
    onCountryChange(v);
  };
  const handleState = (v: string) => {
    onStateChange(v);
  };

  const baseInput = `h-11 w-full rounded-[10px] border bg-white px-3.5 text-sm transition-colors hover:border-border focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10 ${inputClassName}`;

  return (
    <div className="contents">
      {/* Country */}
      <div className="space-y-1.5">
        <SearchableCountrySelect
          value={country}
          onChange={handleCountry}
          countries={countries}
          placeholder="Select country"
          disabled={disabled || countryDisabled}
          aria-invalid={!!errors.country}
        />
        {errors.country && <p className="text-[11px] text-destructive">{errors.country}</p>}
      </div>

      {/* State */}
      <div className="space-y-1.5">
        {states.length > 0 ? (
          <SearchableCountrySelect
            value={state}
            onChange={handleState}
            countries={states.map((s) => s.name)}
            placeholder={country ? "Select state / region" : "Select country first"}
            disabled={disabled || !country}
            allowCustom
            aria-invalid={!!errors.state}
          />
        ) : (
          <Input
            value={state}
            onChange={(e) => handleState(e.target.value)}
            placeholder={country ? "Enter state / region" : "Select country first"}
            disabled={disabled || !country}
            aria-invalid={!!errors.state}
            className={baseInput + (errors.state ? " border-destructive/50 ring-1 ring-destructive/15" : " border-border/60")}
          />
        )}
        {errors.state && <p className="text-[11px] text-destructive">{errors.state}</p>}
      </div>

      {/* City */}
      <div className="space-y-1.5">
        <AsyncCitySelect
          value={city}
          onChange={onCityChange}
          baseOptions={cities}
          country={country}
          state={state}
          placeholder={state ? "Select or search city / LGA" : "Select state first"}
          disabled={disabled || !state}
          aria-invalid={!!errors.city}
        />
        {errors.city && <p className="text-[11px] text-destructive">{errors.city}</p>}
      </div>
    </div>
  );
};

export default LocationSelector;