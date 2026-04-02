import { MapPin, Package, Truck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { QuoteData } from "@/pages/Checkout";

interface CheckoutSummaryCardProps {
  quote: QuoteData;
  formatUsd: (amount: number) => string;
  formatNgn: (amount: number) => string;
  exchangeRates: { NGN: number };
}

const CheckoutSummaryCard = ({ quote, formatUsd, formatNgn, exchangeRates }: CheckoutSummaryCardProps) => {
  return (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-sm">
      {/* Card header */}
      <div className="px-6 py-4 border-b border-border/40 bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
            <Package className="w-4 h-4 text-accent" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">Shipment Summary</h2>
            <p className="text-xs text-muted-foreground">Review your order details</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* Detail rows */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <DetailCell
            icon={<MapPin className="w-4 h-4" />}
            label="Destination"
            value={quote.destination_country}
          />
          <DetailCell
            icon={<Package className="w-4 h-4" />}
            label="Weight"
            value={`${quote.weight} KG`}
          />
          <DetailCell
            icon={<Truck className="w-4 h-4" />}
            label="Service"
            value={quote.service_name}
            subtitle={quote.delivery_estimate}
          />
        </div>

        <Separator className="bg-border/40" />

        {/* Cost breakdown */}
        <div className="space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cost Breakdown</p>
          <div className="space-y-2 text-sm">
            <CostRow
              label={`Base Rate (${quote.weight} KG × ${formatUsd(quote.base_rate)}/KG)`}
              value={formatUsd(quote.base_shipping_cost)}
            />
            <CostRow label="Handling Fee" value={formatUsd(quote.handling_fee)} />
            <CostRow label="Insurance (2%)" value={formatUsd(quote.insurance_fee)} />
          </div>
        </div>

        <Separator className="bg-border/40" />

        {/* Total */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total (USD)</p>
            <p className="text-2xl font-bold text-foreground">{formatUsd(quote.calculated_price)}</p>
          </div>
          <Separator orientation="vertical" className="hidden sm:block h-10" />
          <div className="sm:text-right">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Naira Equivalent</p>
            <p className="text-xl font-bold text-accent">{formatNgn(quote.calculated_price)}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Rate: $1 = ₦{exchangeRates.NGN.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

function DetailCell({ icon, label, value, subtitle }: { icon: React.ReactNode; label: string; value: string; subtitle?: string }) {
  return (
    <div className="flex items-start gap-3 p-3.5 rounded-lg bg-muted/40 border border-border/30">
      <span className="text-accent mt-0.5 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-foreground mt-0.5 truncate">{value}</p>
        {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function CostRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
  );
}

export default CheckoutSummaryCard;
