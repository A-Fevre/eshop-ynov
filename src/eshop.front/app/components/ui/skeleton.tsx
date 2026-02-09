import { cn } from "~/lib/utils";

/**
 * Skeleton component for loading states
 */
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

/**
 * Product card skeleton for loading product grids
 */
export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-10 w-28" />
        </div>
      </div>
    </div>
  );
}

/**
 * Product detail skeleton for loading product pages
 */
export function ProductDetailSkeleton() {
  return (
    <div className="w-full bg-white dark:bg-slate-950">
      <div className="border-b bg-slate-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4 py-4">
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 max-w-7xl mx-auto">
            <div>
              <Skeleton className="aspect-square rounded-3xl" />
            </div>
            <div className="space-y-8">
              <div>
                <Skeleton className="h-6 w-24 mb-3" />
                <Skeleton className="h-12 w-3/4 mb-4" />
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-10 w-40" />
              </div>
              <div>
                <Skeleton className="h-6 w-32 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-6 w-full" />
                ))}
              </div>
              <Skeleton className="h-14 w-full rounded-full" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * Cart item skeleton for loading cart
 */
export function CartItemSkeleton() {
  return (
    <div className="p-4 border rounded-lg">
      <div className="flex gap-4">
        <Skeleton className="w-24 h-24 rounded-md flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/4" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-6 w-20 ml-auto" />
          </div>
        </div>
        <Skeleton className="h-8 w-8" />
      </div>
    </div>
  );
}

/**
 * Dashboard stat card skeleton
 */
export function StatCardSkeleton() {
  return (
    <div className="p-6 border rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-6 rounded" />
      </div>
      <Skeleton className="h-8 w-32 mb-1" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

/**
 * Table row skeleton for admin tables
 */
export function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }, (_, i) => (
        <td key={`skeleton-col-${Math.random()}-${i}`} className="p-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}
