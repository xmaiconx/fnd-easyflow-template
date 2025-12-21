import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useVerifyEmail } from '@/hooks/use-auth'
import { APP_NAME } from '@/lib/constants'
import { toast } from 'sonner'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const verifyEmail = useVerifyEmail()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      setStatus('error')
      toast.error('Token de verificação inválido')
      return
    }

    verifyEmail.mutate(
      { token },
      {
        onSuccess: () => {
          setStatus('success')
          toast.success('Email verificado com sucesso!')
        },
        onError: (error: any) => {
          setStatus('error')
          const message = error.message || 'Erro ao verificar email'
          toast.error(message)
        },
      }
    )
  }, [searchParams])

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{APP_NAME}</h1>
        <p className="text-muted-foreground">Verificação de Email</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Verificação de Email</CardTitle>
          <CardDescription>
            Aguarde enquanto verificamos seu email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            {status === 'loading' && (
              <>
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Verificando seu email...</p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle2 className="h-12 w-12 text-green-500" />
                <p className="text-lg font-medium">Email verificado com sucesso!</p>
                <p className="text-muted-foreground text-center">
                  Sua conta foi ativada. Você já pode fazer login.
                </p>
                <Button asChild className="mt-4">
                  <Link to="/login">Ir para Login</Link>
                </Button>
              </>
            )}

            {status === 'error' && (
              <>
                <XCircle className="h-12 w-12 text-red-500" />
                <p className="text-lg font-medium">Falha na verificação</p>
                <p className="text-muted-foreground text-center">
                  O link de verificação é inválido ou expirou.
                </p>
                <Button asChild variant="outline" className="mt-4">
                  <Link to="/login">Voltar para Login</Link>
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
