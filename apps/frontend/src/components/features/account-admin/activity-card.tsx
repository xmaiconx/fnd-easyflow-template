"use client"

import * as React from "react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Activity } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { AuditLog } from "@/types"

interface ActivityCardProps {
  activity: AuditLog
  className?: string
}

export function ActivityCard({ activity, className }: ActivityCardProps) {
  return (
    <Card className={cn("border", className)}>
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className="rounded-lg bg-primary/10 p-2 shrink-0 h-fit">
            <Activity className="h-4 w-4 text-primary" />
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <p className="text-sm font-medium">{activity.action}</p>
            {activity.user && (
              <p className="text-xs text-muted-foreground">
                por {activity.user.fullName}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(activity.createdAt), {
                addSuffix: true,
                locale: ptBR,
              })}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

ActivityCard.displayName = "ActivityCard"
