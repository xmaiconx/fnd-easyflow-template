"use client"

import * as React from "react"
import { toast } from "sonner"
import { Activity } from "lucide-react"
import { AppShell } from "@/components/layout/app-shell"
import { PageHeader } from "@/components/layout/page-header"
import { SessionCard } from "@/components/features/sessions/session-card"
import { SessionsTable } from "@/components/features/sessions/sessions-table"
import { EmptyState } from "@/components/ui/empty-state"

interface Session {
  id: string
  device: string
  browser: string
  location: string
  lastActive: string
  isCurrent: boolean
}

// Mock Data
const mockSessions: Session[] = [
  {
    id: "1",
    device: "Windows PC",
    browser: "Chrome 131",
    location: "São Paulo, Brazil",
    lastActive: "2025-12-21T10:00:00Z",
    isCurrent: true,
  },
  {
    id: "2",
    device: "iPhone 15",
    browser: "Safari",
    location: "São Paulo, Brazil",
    lastActive: "2025-12-20T08:30:00Z",
    isCurrent: false,
  },
  {
    id: "3",
    device: "MacBook Pro",
    browser: "Firefox 120",
    location: "Rio de Janeiro, Brazil",
    lastActive: "2025-12-19T15:45:00Z",
    isCurrent: false,
  },
  {
    id: "4",
    device: "Android Phone",
    browser: "Chrome Mobile",
    location: "Belo Horizonte, Brazil",
    lastActive: "2025-12-18T12:20:00Z",
    isCurrent: false,
  },
]

export default function SessionsPage() {
  const [sessions, setSessions] = React.useState<Session[]>(mockSessions)
  const [loading, setLoading] = React.useState(false)

  const handleRevokeSession = async (session: Session) => {
    if (session.isCurrent) {
      toast.error("Não é possível revogar a sessão atual")
      return
    }

    try {
      // Simulate API call
      setLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Remove session from list
      setSessions((prev) => prev.filter((s) => s.id !== session.id))

      toast.success("Sessão revogada com sucesso", {
        description: `A sessão em ${session.device} foi encerrada.`,
      })
    } catch (error) {
      toast.error("Erro ao revogar sessão", {
        description: "Tente novamente em alguns instantes.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AppShell currentPath="/sessions" breadcrumb={["Sessões Ativas"]}>
      <div className="space-y-6">
        <PageHeader
          title="Sessões Ativas"
          description="Gerencie os dispositivos conectados à sua conta"
        />

        {sessions.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="Nenhuma sessão ativa"
            description="Você não tem sessões ativas no momento"
          />
        ) : (
          <>
            {/* Desktop: Table */}
            <div className="hidden md:block">
              <SessionsTable
                sessions={sessions}
                onRevoke={handleRevokeSession}
                loading={loading}
              />
            </div>

            {/* Mobile: Cards */}
            <div className="md:hidden space-y-4">
              {sessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  onRevoke={handleRevokeSession}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  )
}
