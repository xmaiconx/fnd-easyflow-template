import * as React from "react"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export interface CardSkeletonProps {
  variant?: "stats" | "list-item" | "chart"
  className?: string
}

const CardSkeleton = React.forwardRef<HTMLDivElement, CardSkeletonProps>(
  ({ variant = "list-item", className }, ref) => {
    return (
      <Card ref={ref} className={cn("", className)}>
        <CardHeader>
          <Skeleton className="h-4 w-1/3 mb-2" />
          <Skeleton className="h-8 w-2/3" />
        </CardHeader>
        <CardContent>
          {variant === "stats" && (
            <>
              <Skeleton className="h-10 w-24 mb-2" />
              <Skeleton className="h-4 w-32" />
            </>
          )}
          {variant === "list-item" && (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/6" />
            </div>
          )}
          {variant === "chart" && (
            <>
              <Skeleton className="h-[200px] w-full mb-4" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    )
  }
)
CardSkeleton.displayName = "CardSkeleton"

export { CardSkeleton }
