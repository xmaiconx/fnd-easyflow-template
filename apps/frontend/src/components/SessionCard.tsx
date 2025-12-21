import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Session } from '@/types/api/auth.types'
import { Monitor, Smartphone, Tablet } from 'lucide-react'

interface SessionCardProps {
  session: Session
  onRevoke: () => void
  isRevoking?: boolean
}

export function SessionCard({ session, onRevoke, isRevoking }: SessionCardProps) {
  const getDeviceIcon = (deviceName?: string) => {
    if (!deviceName) return <Monitor className="h-5 w-5" />

    const lower = deviceName.toLowerCase()
    if (lower.includes('mobile') || lower.includes('phone')) {
      return <Smartphone className="h-5 w-5" />
    }
    if (lower.includes('tablet') || lower.includes('ipad')) {
      return <Tablet className="h-5 w-5" />
    }
    return <Monitor className="h-5 w-5" />
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getDeviceIcon(session.deviceName)}
          <span>{session.deviceName || 'Dispositivo Desconhecido'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <p className="text-sm text-muted-foreground">Endereço IP</p>
          <p className="font-mono text-sm">{session.ipAddress}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Última atividade</p>
          <p className="text-sm">{formatDate(session.lastActivityAt)}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Criado em</p>
          <p className="text-sm">{formatDate(session.createdAt)}</p>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="destructive"
          onClick={onRevoke}
          disabled={isRevoking}
          className="w-full"
        >
          {isRevoking ? 'Revogando...' : 'Revogar Sessão'}
        </Button>
      </CardFooter>
    </Card>
  )
}
