import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2, X } from "lucide-react";
import { findCountryByName, findStateByName } from "@/lib/locationData";

interface LocationData {
  address: string;
  houseNumber: string;
  streetName: string;
  city: string;
  state: string;
  country: string;
  postcode: string;
  lat: number;
  lng: number;
}

interface LocationPickerProps {
  value: string;
  onChange: (value: string) => void;
  onLocationSelect?: (data: LocationData) => void;
  placeholder?: string;
  className?: string;
  country?: string;
  state?: string;
  city?: string;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  name?: string;
  address: {
    amenity?: string;
    building?: string;
    shop?: string;
    office?: string;
    house_name?: string;
    road?: string;
    house_number?: string;
    neighbourhood?: string;
    quarter?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    city_district?: string;
    district?: string;
    state?: string;
    region?: string;
    province?: string;
    country?: string;
    postcode?: string;
    county?: string;
    state_district?: string;
  };
}

const pickFirst = (...values: Array<string | undefined>) => values.find((value) => value?.trim())?.trim() || "";

const parsePostcode = (value: string) => {
  const parts = value.split(",").map((part) => part.trim()).reverse();
  return parts.find((part) => /^(?:\d{5}(?:-\d{4})?|\d{6}|[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2})$/i.test(part)) || "";
};

const parseStreetParts = (streetLine: string, fallback: string) => {
  const cleanLine = (streetLine || fallback).split(",")[0]?.trim() || "";
  const numberFirst = cleanLine.match(/^(\d+[A-Za-z]?(?:[-/]\d+[A-Za-z]?)?)\s+(.+)$/);
  if (numberFirst) return { houseNumber: numberFirst[1], streetName: numberFirst[2].trim(), street: cleanLine };

  const numberLast = cleanLine.match(/^(.+?)\s+(\d+[A-Za-z]?(?:[-/]\d+[A-Za-z]?)?)$/);
  if (numberLast) return { houseNumber: numberLast[2], streetName: numberLast[1].trim(), street: cleanLine };

  return { houseNumber: "", streetName: cleanLine, street: cleanLine };
};

const normalizeStateName = (countryName: string, stateName: string) => {
  if (!countryName || !stateName) return stateName;
  const direct = findStateByName(countryName, stateName);
  if (direct) return direct.name;
  const cleaned = stateName.replace(/\s+State$/i, "").replace(/^Federal Capital Territory$/i, "FCT - Abuja");
  return findStateByName(countryName, cleaned)?.name || cleaned || stateName;
};

const buildLocationData = (result: NominatimResult, fallbackQuery: string): LocationData => {
  const addr = result.address || {};
  const namedPlace = pickFirst(addr.building, addr.house_name, addr.amenity, addr.shop, addr.office, result.name);
  const directStreetName = pickFirst(addr.road, namedPlace, result.display_name.split(",")[0]);
  const directStreet = [addr.house_number, directStreetName].filter(Boolean).join(" ");
  const parsedStreet = parseStreetParts(directStreet || result.display_name, fallbackQuery);
  const parsedQuery = parseStreetParts(fallbackQuery, "");
  const houseNumber = pickFirst(addr.house_number, parsedStreet.houseNumber, parsedQuery.houseNumber);
  const streetName = pickFirst(addr.road, parsedStreet.streetName, parsedQuery.streetName, namedPlace);
  const street = [houseNumber, streetName].filter(Boolean).join(" ") || parsedStreet.street || result.display_name.split(",")[0];

  const country = addr.country || "";
  const state = pickFirst(addr.state, addr.region, addr.province, addr.state_district, addr.county);

  return {
    address: street,
    houseNumber,
    streetName,
    city: pickFirst(addr.city, addr.town, addr.village, addr.municipality, addr.city_district, addr.suburb, addr.neighbourhood, addr.county),
    state: normalizeStateName(country, state),
    country,
    postcode: pickFirst(addr.postcode, parsePostcode(result.display_name)),
    lat: parseFloat(result.lat),
    lng: parseFloat(result.lon),
  };
};

const LocationPicker = ({ value, onChange, onLocationSelect, placeholder = "Search address...", className, country, state, city }: LocationPickerProps) => {
  const [query, setQuery] = useState(value || "");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(value || ""); }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchAddress = useCallback(async (q: string) => {
    if (q.length < 3) { setResults([]); return; }
    setIsSearching(true);
    try {
      const scopedQuery = [q, city, state, country].filter(Boolean).join(", ");
      const selectedCountry = country ? findCountryByName(country) : null;
      const params = new URLSearchParams({
        format: "jsonv2",
        addressdetails: "1",
        extratags: "1",
        namedetails: "1",
        dedupe: "1",
        limit: "8",
        q: scopedQuery,
      });
      if (selectedCountry?.isoCode) params.set("countrycodes", selectedCountry.isoCode.toLowerCase());

      const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
        headers: { "Accept-Language": "en" },
      });
      const data: NominatimResult[] = await res.json();
      setResults(data);
      setShowDropdown(data.length > 0);
    } catch { setResults([]); }
    setIsSearching(false);
  }, [city, country, state]);

  const handleInputChange = (val: string) => {
    setQuery(val);
    onChange(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchAddress(val), 400);
  };

  const enrichResult = async (result: NominatimResult) => {
    try {
      const params = new URLSearchParams({
        format: "jsonv2",
        addressdetails: "1",
        extratags: "1",
        namedetails: "1",
        lat: result.lat,
        lon: result.lon,
        zoom: "18",
      });
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
        headers: { "Accept-Language": "en" },
      });
      if (!res.ok) return result;
      const data = await res.json();
      return { ...result, ...data, address: { ...result.address, ...(data.address || {}) } } as NominatimResult;
    } catch {
      return result;
    }
  };

  const selectResult = async (r: NominatimResult) => {
    setIsSearching(true);
    const enriched = await enrichResult(r);
    const selected = buildLocationData(enriched, query);

    setQuery(selected.address);
    onChange(selected.address);
    setShowDropdown(false);
    setResults([]);
    setIsSearching(false);
    onLocationSelect?.(selected);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Input
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={placeholder}
          className={className || ""}
          onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
        />
        {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />}
        {!isSearching && query && (
          <button type="button" onClick={() => { setQuery(""); onChange(""); setResults([]); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showDropdown && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map((r, i) => (
            <button
              key={i}
              type="button"
              onClick={() => selectResult(r)}
              className="w-full text-left px-3 py-2.5 text-sm hover:bg-accent hover:text-accent-foreground flex items-start gap-2 border-b border-border/30 last:border-0 transition-colors"
            >
              <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span className="text-foreground line-clamp-2">{r.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
