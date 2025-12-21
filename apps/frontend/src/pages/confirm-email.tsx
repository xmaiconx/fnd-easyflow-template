import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { APP_NAME } from '@/lib/constants'
import { useVerifyEmail } from '@/hooks/use-auth'

type ConfirmationState = 'loading' | 'success' | 'error'

export function ConfirmEmailPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [state, setState] = useState<ConfirmationState>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const verifyEmailMutation = useVerifyEmail()

  useEffect(() => {
    const token = searchParams.get('token')

    if (!token) {
      setState('error')
      setErrorMessage('Token de confirmação não encontrado')
      return
    }

    // Auto-confirm when page loads
    handleConfirmation(token)
  }, [searchParams])

  const handleConfirmation = async (token: string) => {
    try {
      setState('loading')
      await verifyEmailMutation.mutateAsync({ token })
      setState('success')

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', {
          state: {
            message: 'Email confirmado com sucesso! Você já pode fazer login.',
          },
        })
      }, 3000)
    } catch (error: any) {
      setState('error')
      const message = error.response?.data?.message || 'Erro ao confirmar email'
      setErrorMessage(message)
    }
  }

  const handleRetryConfirmation = () => {
    const token = searchParams.get('token')
    if (token) {
      handleConfirmation(token)
    }
  }

  const renderContent = () => {
    switch (state) {
      case 'loading':
        return (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
              </div>
              <CardTitle className="text-blue-900">Confirmando Email...</CardTitle>
              <CardDescription>
                Aguarde enquanto confirmamos seu email
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-sm text-muted-foreground">
                Este processo pode levar alguns segundos.
              </p>
            </CardContent>
          </>
        )

      case 'success':
        return (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-green-900">Email Confirmado!</CardTitle>
              <CardDescription>
                Sua conta foi ativada com sucesso
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Você será redirecionado para a tela de login em alguns segundos...
              </p>
              <Button onClick={() => navigate('/login')} className="w-full">
                Ir para Login Agora
              </Button>
            </CardContent>
          </>
        )

      case 'error':
        return (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <CardTitle className="text-red-900">Erro na Confirmação</CardTitle>
              <CardDescription>
                Não foi possível confirmar seu email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-700 text-center">
                  {errorMessage}
                </p>
              </div>

              <div className="space-y-2">
                {searchParams.get('token') && (
                  <Button
                    onClick={handleRetryConfirmation}
                    variant="outline"
                    className="w-full"
                    disabled={verifyEmailMutation.isPending}
                  >
                    {verifyEmailMutation.isPending ? 'Tentando novamente...' : 'Tentar Novamente'}
                  </Button>
                )}

                <Button
                  onClick={() => navigate('/signup')}
                  variant="ghost"
                  className="w-full"
                >
                  Voltar ao Cadastro
                </Button>
              </div>
            </CardContent>
          </>
        )
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{APP_NAME}</h1>
        <p className="text-muted-foreground">
          Confirmação de Email
        </p>
      </div>

      <Card>
        {renderContent()}
      </Card>
    </div>
  )
}