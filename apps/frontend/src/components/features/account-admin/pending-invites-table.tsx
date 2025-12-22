"use client"

import * as React from "react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { RefreshCw, X } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { AccountInvite } from "@/types"

interface PendingInvitesTableProps {
  invites: AccountInvite[]
  onResend: (inviteId: string) => void
  onCancel: (inviteId: string) => void
  isLoading?: boolean
}

const roleLabels: Record<string, string> = {
  owner: 'Proprietário',
  admin: 'Administrador',
  member: 'Membro',
}

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  expired: 'destructive',
  canceled: 'outline',
  accepted: 'default',
}

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  expired: 'Expirado',
  canceled: 'Cancelado',
  accepted: 'Aceito',
}

export function PendingInvitesTable({ invites, onResend, onCancel, isLoading }: PendingInvitesTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Permissão</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expira em</TableHead>
              <TableHead className="w-[150px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(3)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-8 w-24" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Permissão</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Expira em</TableHead>
            <TableHead className="w-[150px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invites.map((invite) => (
            <TableRow key={invite.id}>
              <TableCell className="font-medium">{invite.email}</TableCell>
              <TableCell>
                <Badge variant="outline">{roleLabels[invite.role]}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={statusVariants[invite.status]}>
                  {statusLabels[invite.status]}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(invite.expiresAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onResend(invite.id)}
                    disabled={invite.status !== 'pending'}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCancel(invite.id)}
                    disabled={invite.status !== 'pending'}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

PendingInvitesTable.displayName = "PendingInvitesTable"
