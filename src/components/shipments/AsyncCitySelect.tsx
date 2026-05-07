import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, Check, X, Loader2 } from "lucide-react";

interface AsyncCitySelectProps {
  value: string;
  onChange: (value: string) => void;
  baseOptions: string[];
  country: string;
  state: string;
  placeholder?: string;
  disabled?: boolean;
  "aria-invalid"?: boolean;
}

/**
 * City/LGA selector that merges a local dataset with live OpenStreetMap
 * (Nominatim) results scoped to the selected country + state. Works for every
 * country (US counties, UK boroughs, Canadian municipalities, etc.) without
 * any API key. Users can also type a custom value if nothing matches.
 */
const AsyncCitySelect = ({
  value,
  onChange,
  baseOptions,
  country,
  state,
  placeholder = "Select city / LGA",
  disabled = false,
  "aria-invalid": ariaInvalid,
}: AsyncCitySelectProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [remote, setRemote] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (open && searchRef.current) setTimeout(() => searchRef.current?.focus(), 50);
  }, [open]);

  // Reset remote results when scope changes
  useEffect(() => {
    setRemote([]);
  }, [country, state]);

  // Debounced live search via Nominatim (keyless, free)
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (!open || !country || !state || search.trim().length < 2) {
      setLoading(false);
      return;
    }
    debounceRef.current = window.setTimeout(async () => {
      try {
        setLoading(true);
        const q = encodeURIComponent(`${search}, ${state}, ${country}`);
        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=20&q=${q}`;
        const res = await fetch(url, { headers: { Accept: "application/json" } });
        if (!res.ok) return;
        const data: any[] = await res.json();
        const names = data
          .map((d) => {
            const a = d.address || {};
            return (
              a.city ||
              a.town ||
              a.village ||
              a.hamlet ||
              a.municipality ||
              a.county ||
              a.borough ||
              a.suburb ||
              a.city_district ||
              null
            );
          })
          .filter((n): n is string => !!n)
          .filter((v, i, arr) => arr.indexOf(v) === i);
        setRemote(names);
      } catch {
        /* ignore network errors — local list still works */
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [search, country, state, open]);

  const merged = useMemo(() => {
    const set = new Map<string, string>();
    [...baseOptions, ...remote].forEach((n) => set.set(n.toLowerCase(), n));
    return Array.from(set.values()).sort((a, b) => a.localeCompare(b));
  }, [baseOptions, remote]);

  const filtered = merged.filter((c) => c.toLowerCase().includes(search.toLowerCase()));
  const showUseCustom =
    search.trim().length > 0 &&
    !filtered.some((c) => c.toLowerCase() === search.trim().toLowerCase());

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={`flex h-11 w-full items-center justify-between rounded-[10px] border bg-white px-3.5 text-sm transition-colors duration-150 hover:border-border focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10 ${
          ariaInvalid ? "border-destructive/50 ring-1 ring-destructive/15" : "border-border/60"
        } ${disabled ? "cursor-not-allowed opacity-60 bg-muted/30" : "cursor-pointer"}`}
      >
        <span className={value ? "text-foreground" : "text-muted-foreground/50"}>
          {value || placeholder}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-white shadow-lg">
          <div className="relative border-b border-border/40 p-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type a city, LGA, county…"
              className="h-9 w-full rounded-md border border-border/40 bg-muted/20 pl-8 pr-8 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/10"
            />
            {loading ? (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 animate-spin text-muted-foreground" />
            ) : (
              search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )
            )}
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 && !showUseCustom ? (
              <p className="px-3 py-4 text-center text-sm text-muted-foreground">
                {loading ? "Searching…" : "Type to search"}
              </p>
            ) : (
              <>
                {filtered.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      onChange(c);
                      setOpen(false);
                      setSearch("");
                    }}
                    className={`flex w-full items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-accent/50 ${
                      value === c ? "bg-primary/5 text-primary font-medium" : "text-foreground"
                    }`}
                  >
                    <span>{c}</span>
                    {value === c && <Check className="h-3.5 w-3.5 text-primary" />}
                  </button>
                ))}
                {showUseCustom && (
                  <button
                    type="button"
                    onClick={() => {
                      onChange(search.trim());
                      setOpen(false);
                      setSearch("");
                    }}
                    className="flex w-full items-center gap-2 border-t border-border/40 px-3 py-2 text-sm text-primary hover:bg-accent/50"
                  >
                    Use "{search.trim()}"
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AsyncCitySelect;