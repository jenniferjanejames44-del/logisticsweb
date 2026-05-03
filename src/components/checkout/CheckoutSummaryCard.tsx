import { MapPin, Package, Truck, Plane, ArrowRight } from "lucide-react";
import type { QuoteData } from "@/pages/Checkout";

interface CheckoutSummaryCardProps {
  quote: QuoteData;
  formatUsd: (amount: number) => string;
  formatNgn: (amount: number) => string;
  exchangeRates: { NGN: number };
}

const CheckoutSummaryCard = ({ quote, formatUsd, formatNgn, exchangeRates }: CheckoutSummaryCardProps) => {
  return (
    <div className="space-y-4">
      {/* Hero total card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-[#0a1a6b] text-white shadow-lg">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
        <div className="relative px-6 py-7 sm:px-8 sm:py-8">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            Total to Pay
          </div>
          <div className="mt-3 flex items-baseline gap-3 flex-wrap">
            <p className="text-4xl font-bold tracking-tight sm:text-5xl">{formatUsd(quote.calculated_price)}</p>
            <span className="text-sm font-medium text-white/80">USD</span>
          </div>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 backdrop-blur-sm">
            <span className="text-xs text-white/80">≈</span>
            <span className="text-sm font-semibold text-white">{formatNgn(quote.calculated_price)}</span>
            <span className="text-[11px] text-white/60">@ ₦{exchangeRates.NGN.toLocaleString()}/$</span>
          </div>
        </div>
      </div>

      {/* Route visualization */}
      <div className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground mb-4">Shipment Route</p>
        <div className="flex items-center gap-3">
          <RouteEnd label="From" place="Lagos, Nigeria" />
          <div className="flex flex-1 items-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-border via-accent/40 to-border" />
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent">
              <Plane className="h-4 w-4" />
            </div>
            <div className="h-px flex-1 bg-gradient-to-r from-border via-accent/40 to-border" />
          </div>
          <RouteEnd label="To" place={quote.destination_country} align="right" />
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border/40 pt-4">
          <MiniStat icon={<Truck className="h-4 w-4" />} label="Service" value={quote.service_name} sub={quote.delivery_estimate} />
          <MiniStat icon={<Package className="h-4 w-4" />} label="Weight" value={`${quote.weight} KG`} />
          <MiniStat icon={<MapPin className="h-4 w-4" />} label="Estimate" value={quote.delivery_estimate || "—"} />
        </div>
      </div>

      {/* Cost breakdown */}
      <div className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Cost Breakdown</p>
          <span className="text-[10px] font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded">USD</span>
        </div>
        <div className="space-y-2.5 text-sm">
          <CostRow
            label={`Base Rate · ${quote.weight} KG × ${formatUsd(quote.base_rate)}`}
            value={formatUsd(quote.base_shipping_cost)}
          />
          <CostRow label="Handling Fee" value={formatUsd(quote.handling_fee)} />
          <CostRow label="Insurance (2%)" value={formatUsd(quote.insurance_fee)} />
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-dashed border-border/60 pt-4">
          <span className="text-sm font-semibold text-foreground">Total</span>
          <div className="text-right">
            <p className="text-lg font-bold text-foreground">{formatUsd(quote.calculated_price)}</p>
            <p className="text-[11px] text-muted-foreground">{formatNgn(quote.calculated_price)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

function RouteEnd({ label, place, align = "left" }: { label: string; place: string; align?: "left" | "right" }) {
  return (
    <div className={align === "right" ? "text-right min-w-0" : "min-w-0"}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground truncate mt-0.5">{place}</p>
    </div>
  );
}

function MiniStat({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <span className="text-accent">{icon}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <p className="mt-1 text-sm font-semibold text-foreground truncate">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground truncate">{sub}</p>}
    </div>
  );
}

function CostRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-foreground tabular-nums">{value}</span>
    </div>
  );
}

export default CheckoutSummaryCard;
