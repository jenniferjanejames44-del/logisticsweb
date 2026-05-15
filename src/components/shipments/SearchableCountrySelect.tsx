import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check, X } from "lucide-react";

interface SearchableCountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  countries: string[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  allowCustom?: boolean;
  "aria-invalid"?: boolean;
}

const SearchableCountrySelect = ({
  value,
  onChange,
  countries,
  placeholder = "Select country",
  disabled = false,
  className = "",
  allowCustom = false,
  "aria-invalid": ariaInvalid,
}: SearchableCountrySelectProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

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
    if (open && searchRef.current) {
      setTimeout(() => searchRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = countries.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={`flex h-11 w-full items-center justify-between rounded-[10px] border bg-white px-3.5 text-sm transition-colors duration-150 hover:border-border focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/10 ${
          ariaInvalid
            ? "border-destructive/50 ring-1 ring-destructive/15"
            : "border-border/60"
        } ${disabled ? "cursor-not-allowed opacity-60 bg-muted/30" : "cursor-pointer"} ${className}`}
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
              placeholder="Type to search..."
              className="h-9 w-full rounded-md border border-border/40 bg-muted/20 pl-8 pr-8 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/10"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              allowCustom && search.trim() ? (
                <button
                  type="button"
                  onClick={() => { onChange(search.trim()); setOpen(false); setSearch(""); }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-accent/50"
                >
                  Use "{search.trim()}"
                </button>
              ) : (
                <p className="px-3 py-4 text-center text-sm text-muted-foreground">No matches</p>
              )
            ) : (
              <>
              {filtered.map((country) => (
                <button
                  key={country}
                  type="button"
                  onClick={() => {
                    onChange(country);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-accent/50 ${
                    value === country ? "bg-primary/5 text-primary font-medium" : "text-foreground"
                  }`}
                >
                  <span>{country}</span>
                  {value === country && <Check className="h-3.5 w-3.5 text-primary" />}
                </button>
              ))}
              {allowCustom && search.trim() && !filtered.some((c) => c.toLowerCase() === search.trim().toLowerCase()) && (
                <button
                  type="button"
                  onClick={() => { onChange(search.trim()); setOpen(false); setSearch(""); }}
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

export default SearchableCountrySelect;
