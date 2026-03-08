import { DollarSign, Package, Shield, FileText, Calculator } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface CostBreakdownProps {
  shippingFee: number;
  handlingFee?: number;
  packagingFee?: number;
  insuranceFee?: number;
  taxRate?: number;
  currency?: string;
  weight?: number;
  pricePerKg?: number;
}

const CostBreakdown = ({
  shippingFee,
  handlingFee = 0,
  packagingFee = 0,
  insuranceFee = 0,
  taxRate = 0,
  currency = "₦",
  weight,
  pricePerKg,
}: CostBreakdownProps) => {
  const subtotal = shippingFee + handlingFee + packagingFee + insuranceFee;
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  const formatCurrency = (amount: number) => {
    return `${currency}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <Card className="border-border/40 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Calculator className="w-4 h-4 text-primary" strokeWidth={2.5} />
          </div>
          Cost Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Shipping Fee */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <DollarSign className="w-4 h-4 text-muted-foreground flex-shrink-0" strokeWidth={2.5} />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">Shipping Fee</p>
              {weight && pricePerKg && (
                <p className="text-xs text-muted-foreground">
                  {weight} kg × {formatCurrency(pricePerKg)}/kg
                </p>
              )}
            </div>
          </div>
          <span className="text-sm font-semibold text-foreground whitespace-nowrap">
            {formatCurrency(shippingFee)}
          </span>
        </div>

        {/* Handling Fee */}
        {handlingFee > 0 && (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-muted-foreground" strokeWidth={2.5} />
              <p className="text-sm font-medium text-foreground">Handling Fee</p>
            </div>
            <span className="text-sm font-semibold text-foreground">
              {formatCurrency(handlingFee)}
            </span>
          </div>
        )}

        {/* Packaging Fee */}
        {packagingFee > 0 && (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-muted-foreground" strokeWidth={2.5} />
              <p className="text-sm font-medium text-foreground">Packaging Materials</p>
            </div>
            <span className="text-sm font-semibold text-foreground">
              {formatCurrency(packagingFee)}
            </span>
          </div>
        )}

        {/* Insurance Fee */}
        {insuranceFee > 0 && (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-muted-foreground" strokeWidth={2.5} />
              <p className="text-sm font-medium text-foreground">Insurance</p>
            </div>
            <span className="text-sm font-semibold text-foreground">
              {formatCurrency(insuranceFee)}
            </span>
          </div>
        )}

        {/* Subtotal */}
        <Separator className="my-2" />
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-muted-foreground">Subtotal</p>
          <span className="text-sm font-semibold text-foreground">
            {formatCurrency(subtotal)}
          </span>
        </div>

        {/* Tax */}
        {taxRate > 0 && (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-muted-foreground" strokeWidth={2.5} />
              <p className="text-sm font-medium text-muted-foreground">Tax ({taxRate}%)</p>
            </div>
            <span className="text-sm font-semibold text-foreground">
              {formatCurrency(taxAmount)}
            </span>
          </div>
        )}

        {/* Total */}
        <Separator className="my-2" />
        <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
          <p className="text-base font-bold text-foreground">Total Amount</p>
          <span className="text-lg font-bold text-primary">
            {formatCurrency(total)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default CostBreakdown;

