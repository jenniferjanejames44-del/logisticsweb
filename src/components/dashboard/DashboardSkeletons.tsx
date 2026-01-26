import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

// Stats Card Skeleton - Responsive
export const StatsCardSkeleton = () => (
  <Card className="border-border/50">
    <CardContent className="p-4 sm:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-2 min-w-0 flex-1">
          <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
          <Skeleton className="h-6 sm:h-8 w-16 sm:w-20" />
        </div>
        <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex-shrink-0" />
      </div>
    </CardContent>
  </Card>
);

// Stats Grid Skeleton (4 cards) - Responsive
export const StatsGridSkeleton = ({ count = 4 }: { count?: number }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
    {Array.from({ length: count }).map((_, i) => (
      <StatsCardSkeleton key={i} />
    ))}
  </div>
);

// Quick Action Card Skeleton - Responsive
export const QuickActionSkeleton = () => (
  <Card className="border-border/50">
    <CardContent className="p-4 sm:p-6">
      <div className="flex items-center gap-3 sm:gap-4">
        <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex-shrink-0" />
        <div className="space-y-2 min-w-0 flex-1">
          <Skeleton className="h-4 sm:h-5 w-24 sm:w-32" />
          <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Shipment Card Skeleton - Responsive
export const ShipmentCardSkeleton = () => (
  <Card className="border-border/50">
    <CardContent className="p-4 sm:p-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 sm:gap-4">
          <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex-shrink-0" />
          <div className="space-y-2 sm:space-y-3 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Skeleton className="h-4 sm:h-5 w-24 sm:w-32" />
              <Skeleton className="h-5 sm:h-6 w-16 sm:w-20 rounded-full" />
            </div>
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4">
              <Skeleton className="h-3 sm:h-4 w-full sm:w-48" />
              <Skeleton className="h-3 sm:h-4 w-12 sm:w-16" />
              <Skeleton className="h-3 sm:h-4 w-20 sm:w-28" />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/50 sm:border-0 sm:pt-0">
          <Skeleton className="h-5 sm:h-6 w-20 sm:w-24" />
          <Skeleton className="h-4 w-24 sm:w-28" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Payment Card Skeleton - Responsive
export const PaymentCardSkeleton = () => (
  <Card className="border-border/50">
    <CardContent className="p-4 sm:p-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 sm:gap-4">
          <Skeleton className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex-shrink-0" />
          <div className="space-y-2 sm:space-y-3 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <Skeleton className="h-4 sm:h-5 w-20 sm:w-28" />
              <Skeleton className="h-5 sm:h-6 w-16 sm:w-20 rounded-full" />
            </div>
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4">
              <Skeleton className="h-3 sm:h-4 w-28 sm:w-32" />
              <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/50 sm:border-0 sm:pt-0">
          <Skeleton className="h-3 sm:h-4 w-24" />
          <Skeleton className="h-3 sm:h-4 w-28 sm:w-32" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Transaction Item Skeleton - Responsive
export const TransactionSkeleton = () => (
  <div className="flex items-center justify-between p-3 sm:p-4 rounded-lg border border-border/50 gap-3">
    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
      <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex-shrink-0" />
      <div className="space-y-1.5 sm:space-y-2 min-w-0 flex-1">
        <Skeleton className="h-4 sm:h-5 w-24 sm:w-28" />
        <Skeleton className="h-3 sm:h-4 w-28 sm:w-36" />
      </div>
    </div>
    <div className="text-right space-y-1.5 sm:space-y-2 flex-shrink-0">
      <Skeleton className="h-4 sm:h-5 w-16 sm:w-20 ml-auto" />
      <Skeleton className="h-4 sm:h-5 w-12 sm:w-14 ml-auto rounded-full" />
    </div>
  </div>
);

// Recent Shipments Skeleton (for Overview) - Responsive
export const RecentShipmentsSkeleton = () => (
  <Card className="border-border/50">
    <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6">
      <Skeleton className="h-5 sm:h-6 w-32 sm:w-40" />
      <Skeleton className="h-4 sm:h-5 w-16 sm:w-20" />
    </CardHeader>
    <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
      <div className="space-y-3 sm:space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 sm:p-4 bg-muted/50 rounded-lg gap-3"
          >
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
              <Skeleton className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex-shrink-0" />
              <div className="space-y-1.5 sm:space-y-2 min-w-0 flex-1">
                <Skeleton className="h-4 sm:h-5 w-24 sm:w-28" />
                <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
              </div>
            </div>
            <Skeleton className="h-5 sm:h-6 w-16 sm:w-20 rounded-full flex-shrink-0" />
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Overview Page Complete Skeleton - Responsive
export const OverviewSkeleton = () => (
  <div className="space-y-6 sm:space-y-8">
    {/* Stats Grid */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>

    {/* Quick Actions */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <QuickActionSkeleton key={i} />
      ))}
    </div>

    {/* Recent Shipments */}
    <RecentShipmentsSkeleton />
  </div>
);

// Shipments Page Skeleton - Responsive
export const ShipmentsListSkeleton = () => (
  <div className="space-y-4 sm:space-y-6">
    {/* Balance Card Skeleton */}
    <Card className="border-border/50 bg-gradient-to-r from-secondary/10 to-secondary/5">
      <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex-shrink-0" />
          <div className="space-y-1.5 sm:space-y-2">
            <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
            <Skeleton className="h-5 sm:h-6 w-16 sm:w-20" />
          </div>
        </div>
        <Skeleton className="h-8 sm:h-9 w-full sm:w-28" />
      </CardContent>
    </Card>

    {/* Actions Bar Skeleton */}
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
      <Skeleton className="h-10 flex-1" />
      <Skeleton className="h-10 w-full sm:w-[180px]" />
      <Skeleton className="h-10 w-full sm:w-36" />
    </div>

    {/* Shipments List Skeleton */}
    <div className="grid gap-3 sm:gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <ShipmentCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

// Payments Page Skeleton - Responsive
export const PaymentsListSkeleton = () => (
  <div className="space-y-6 sm:space-y-8">
    {/* Stats */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>

    {/* Filters Skeleton */}
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
      <Skeleton className="h-10 flex-1" />
      <Skeleton className="h-10 w-full sm:w-[180px]" />
    </div>

    {/* Payments List */}
    <div className="grid gap-3 sm:gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <PaymentCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

// Wallet Page Skeleton - Responsive
export const WalletSkeleton = () => (
  <div className="space-y-4 sm:space-y-6">
    {/* Balance Cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className={`border-border/50 ${i === 0 ? "bg-gradient-to-br from-secondary/10 to-secondary/5" : ""}`}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1.5 sm:space-y-2 min-w-0 flex-1">
                <Skeleton className="h-3 sm:h-4 w-24 sm:w-28" />
                <Skeleton className="h-6 sm:h-8 w-20 sm:w-24" />
              </div>
              <Skeleton className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Info Card Skeleton */}
    <Card className="border-border/50 bg-muted/30">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-start gap-3 sm:gap-4">
          <Skeleton className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex-shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 sm:h-5 w-40 sm:w-48" />
            <Skeleton className="h-3 sm:h-4 w-full max-w-md" />
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Transactions Skeleton */}
    <Card className="border-border/50">
      <CardHeader className="p-4 sm:p-6">
        <Skeleton className="h-5 sm:h-6 w-36 sm:w-44" />
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
        <div className="space-y-2 sm:space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <TransactionSkeleton key={i} />
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// Profile Section Skeleton - Responsive
export const ProfileSkeleton = () => (
  <div className="space-y-4 sm:space-y-6">
    {/* Avatar Card */}
    <Card className="border-border/50">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
          <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex-shrink-0" />
          <div className="space-y-2 w-full sm:w-auto">
            <Skeleton className="h-5 sm:h-6 w-32 sm:w-40 mx-auto sm:mx-0" />
            <Skeleton className="h-4 w-40 sm:w-48 mx-auto sm:mx-0" />
            <Skeleton className="h-8 sm:h-9 w-28 sm:w-32 mt-2 mx-auto sm:mx-0" />
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Form Skeleton */}
    <Card className="border-border/50">
      <CardHeader className="p-4 sm:p-6">
        <Skeleton className="h-5 sm:h-6 w-28 sm:w-36" />
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0 space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
              <Skeleton className="h-9 sm:h-10 w-full" />
            </div>
          ))}
        </div>
        <Skeleton className="h-9 sm:h-10 w-full sm:w-32" />
      </CardContent>
    </Card>
  </div>
);

// Notifications Skeleton - Responsive
export const NotificationsSkeleton = () => (
  <div className="space-y-3 sm:space-y-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <Card key={i} className="border-border/50">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <Skeleton className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 sm:h-5 w-28 sm:w-36" />
                    {i < 2 && <Skeleton className="h-5 w-10 rounded-full" />}
                  </div>
                  <Skeleton className="h-3 sm:h-4 w-full" />
                </div>
                <Skeleton className="h-3 sm:h-4 w-16 sm:w-20 flex-shrink-0" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// Table Skeleton - Responsive
export const TableSkeleton = ({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) => (
  <div className="border border-border rounded-lg overflow-hidden overflow-x-auto">
    {/* Header */}
    <div className="bg-muted p-3 sm:p-4 flex gap-3 sm:gap-4 min-w-[600px]">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-3 sm:h-4 flex-1" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="p-3 sm:p-4 flex gap-3 sm:gap-4 border-t border-border min-w-[600px]">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} className="h-3 sm:h-4 flex-1" />
        ))}
      </div>
    ))}
  </div>
);
