import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Stats Card Skeleton
export const StatsCardSkeleton = () => (
  <Card className="border-border/50">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
        <Skeleton className="w-12 h-12 rounded-xl" />
      </div>
    </CardContent>
  </Card>
);

// Stats Grid Skeleton (4 cards)
export const StatsGridSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className={`grid sm:grid-cols-2 lg:grid-cols-${count} gap-6 mb-8`}>
    {Array.from({ length: count }).map((_, i) => (
      <StatsCardSkeleton key={i} />
    ))}
  </div>
);

// Quick Action Card Skeleton
export const QuickActionSkeleton = () => (
  <Card className="border-border/50">
    <CardContent className="p-6">
      <div className="flex items-center gap-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Shipment Card Skeleton
export const ShipmentCardSkeleton = () => (
  <Card className="border-border/50">
    <CardContent className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        </div>
        <div className="text-right space-y-2">
          <Skeleton className="h-6 w-24 ml-auto" />
          <Skeleton className="h-4 w-28 ml-auto" />
          <Skeleton className="h-6 w-20 ml-auto rounded-full" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Payment Card Skeleton
export const PaymentCardSkeleton = () => (
  <Card className="border-border/50">
    <CardContent className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
        <div className="text-right space-y-2">
          <Skeleton className="h-4 w-24 ml-auto" />
          <Skeleton className="h-4 w-32 ml-auto" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Transaction Item Skeleton
export const TransactionSkeleton = () => (
  <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
    <div className="flex items-center gap-4">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-4 w-36" />
      </div>
    </div>
    <div className="text-right space-y-2">
      <Skeleton className="h-5 w-20 ml-auto" />
      <Skeleton className="h-5 w-14 ml-auto rounded-full" />
    </div>
  </div>
);

// Recent Shipments Skeleton (for Overview)
export const RecentShipmentsSkeleton = () => (
  <Card className="border-border/50">
    <CardHeader className="flex flex-row items-center justify-between">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-5 w-20" />
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
          >
            <div className="flex items-center gap-4">
              <Skeleton className="w-10 h-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Overview Page Complete Skeleton
export const OverviewSkeleton = () => (
  <div className="space-y-8">
    {/* Stats Grid */}
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>

    {/* Quick Actions */}
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <QuickActionSkeleton key={i} />
      ))}
    </div>

    {/* Recent Shipments */}
    <RecentShipmentsSkeleton />
  </div>
);

// Shipments Page Skeleton
export const ShipmentsListSkeleton = () => (
  <div className="space-y-6">
    {/* Balance Card Skeleton */}
    <Card className="border-border/50 bg-gradient-to-r from-secondary/10 to-secondary/5">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
        <Skeleton className="h-9 w-28" />
      </CardContent>
    </Card>

    {/* Actions Bar Skeleton */}
    <div className="flex flex-col sm:flex-row gap-4">
      <Skeleton className="h-10 flex-1" />
      <Skeleton className="h-10 w-full sm:w-[180px]" />
      <Skeleton className="h-10 w-36" />
    </div>

    {/* Shipments List Skeleton */}
    <div className="grid gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <ShipmentCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

// Payments Page Skeleton
export const PaymentsListSkeleton = () => (
  <div className="space-y-8">
    {/* Stats */}
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>

    {/* Filters Skeleton */}
    <div className="flex flex-col sm:flex-row gap-4">
      <Skeleton className="h-10 flex-1" />
      <Skeleton className="h-10 w-full sm:w-[180px]" />
    </div>

    {/* Payments List */}
    <div className="grid gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <PaymentCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

// Wallet Page Skeleton
export const WalletSkeleton = () => (
  <div className="space-y-6">
    {/* Balance Cards */}
    <div className="grid md:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className={`border-border/50 ${i === 0 ? "bg-gradient-to-br from-secondary/10 to-secondary/5" : ""}`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-8 w-24" />
              </div>
              <Skeleton className="w-14 h-14 rounded-xl" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Info Card Skeleton */}
    <Card className="border-border/50 bg-muted/30">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Transactions Skeleton */}
    <Card className="border-border/50">
      <CardHeader>
        <Skeleton className="h-6 w-44" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <TransactionSkeleton key={i} />
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// Profile Section Skeleton
export const ProfileSkeleton = () => (
  <div className="space-y-6">
    {/* Avatar Card */}
    <Card className="border-border/50">
      <CardContent className="p-6">
        <div className="flex items-center gap-6">
          <Skeleton className="w-24 h-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-9 w-32 mt-2" />
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Form Skeleton */}
    <Card className="border-border/50">
      <CardHeader>
        <Skeleton className="h-6 w-36" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
        <Skeleton className="h-10 w-32" />
      </CardContent>
    </Card>
  </div>
);

// Table Skeleton
export const TableSkeleton = ({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) => (
  <div className="border border-border rounded-lg overflow-hidden">
    {/* Header */}
    <div className="bg-muted p-4 flex gap-4">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="p-4 flex gap-4 border-t border-border">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} className="h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);
