import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { SessionCard } from '@/components/SessionCard'
import { useSessions, useRevokeSession } from '@/hooks/use-sessions'
import { toast } from 'sonner'
import { Loader2, AlertCircle } from 'lucide-react'

export function SessionsPage() {
  const { data: sessions, isLoading, error } = useSessions()
  const revokeSession = useRevokeSession()

  const handleRevoke = (sessionId: string) => {
    revokeSession.mutate(sessionId, {
      onSuccess: () => {
        toast.success('Sessão revogada com sucesso!')
      },
      onError: (error: any) => {
        const message = error.message || 'Erro ao revogar sessão'
        toast.error(message)
      },
    })
  }

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
            <p className="text-lg font-medium">Erro ao carregar sessões</p>
            <p className="text-muted-foreground">
              {(error as any)?.message || 'Ocorreu um erro ao carregar as sessões ativas'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sessões Ativas</h1>
        <p className="text-muted-foreground">
          Gerencie todas as sessões ativas da sua conta
        </p>
      </div>

      {!sessions || sessions.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Nenhuma sessão ativa</CardTitle>
            <CardDescription>
              Você não possui nenhuma sessão ativa no momento
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onRevoke={() => handleRevoke(session.id)}
              isRevoking={revokeSession.isPending}
            />
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Sobre as Sessões</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Uma sessão é criada toda vez que você faz login em um dispositivo ou navegador.
          </p>
          <p>
            Você pode revogar sessões de dispositivos que não reconhece ou que não usa mais.
          </p>
          <p>
            Ao revogar uma sessão, você será desconectado daquele dispositivo imediatamente.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
