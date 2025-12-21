import * as React from "react"

import { CardSkeleton } from "@/components/ui/card-skeleton"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export interface PageSkeletonProps {
  variant?: "dashboard" | "list" | "form"
  className?: string
}

const PageSkeleton = React.forwardRef<HTMLDivElement, PageSkeletonProps>(
  ({ variant = "list", className }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-6 p-4 md:p-6", className)}>
        {/* PageHeader Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96" />
        </div>

        {variant === "dashboard" && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <CardSkeleton variant="stats" />
              <CardSkeleton variant="stats" />
              <CardSkeleton variant="stats" />
              <CardSkeleton variant="stats" />
            </div>

            {/* Chart Skeleton */}
            <CardSkeleton variant="chart" />
          </>
        )}

        {variant === "list" && (
          <div className="space-y-4">
            <CardSkeleton variant="list-item" />
            <CardSkeleton variant="list-item" />
            <CardSkeleton variant="list-item" />
            <CardSkeleton variant="list-item" />
            <CardSkeleton variant="list-item" />
          </div>
        )}

        {variant === "form" && (
          <div className="max-w-2xl space-y-6">
            {/* Form Field Skeletons */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-11 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-11 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-24 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-11 w-full" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-11 w-24" />
              <Skeleton className="h-11 w-24" />
            </div>
          </div>
        )}
      </div>
    )
  }
)
PageSkeleton.displayName = "PageSkeleton"

export { PageSkeleton }
