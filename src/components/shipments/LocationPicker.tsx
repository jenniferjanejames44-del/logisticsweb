import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2, X } from "lucide-react";

interface LocationData {
  address: string;
  city: string;
  state: string;
  country: string;
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
  address: {
    road?: string;
    house_number?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

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
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=8&q=${encodeURIComponent(scopedQuery)}`, {
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

  const selectResult = (r: NominatimResult) => {
    const addr = r.address;
    const street = [addr.house_number, addr.road].filter(Boolean).join(" ") || r.display_name.split(",")[0];
    const city = addr.city || addr.town || addr.village || "";
    const state = addr.state || "";
    const country = addr.country || "";

    setQuery(street);
    onChange(street);
    setShowDropdown(false);
    setResults([]);

    onLocationSelect?.({
      address: street,
      city,
      state,
      country,
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
    });
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
