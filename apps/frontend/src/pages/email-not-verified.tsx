import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingButton } from '@/components/forms'
import { Mail, AlertTriangle, Clock } from 'lucide-react'
import { APP_NAME } from '@/lib/constants'
import { useResendConfirmation } from '@/hooks/use-auth'
import { toast } from 'sonner'

export function EmailNotVerifiedPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState<string>('')
  const resendConfirmationMutation = useResendConfirmation()

  useEffect(() => {
    // Get email from location state or redirect to login
    if (location.state?.email) {
      setEmail(location.state.email)
    } else {
      navigate('/login', { replace: true })
    }
  }, [location.state, navigate])

  const handleResendConfirmation = async () => {
    if (!email) return

    try {
      await resendConfirmationMutation.mutateAsync({ email })
      toast.success('Email de confirmação reenviado com sucesso!')
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao reenviar email'
      toast.error(message)
    }
  }

  if (!email) {
    return null // Will redirect to login
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{APP_NAME}</h1>
        <p className="text-muted-foreground">
          Email não confirmado
        </p>
      </div>

      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <CardTitle className="text-amber-900">Confirmação Necessária</CardTitle>
          <CardDescription>
            Você precisa confirmar seu email antes de fazer login
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span>Email cadastrado:</span>
            </div>
            <div className="font-medium text-center">{email}</div>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-amber-800">
              <Clock className="w-4 h-4" />
              <span className="font-medium text-sm">Email de confirmação</span>
            </div>
            <p className="text-sm text-amber-700">
              Verifique sua caixa de entrada (incluindo spam) e clique no link de confirmação.
              Se não encontrou o email, você pode solicitar um novo abaixo.
            </p>
          </div>

          <div className="space-y-3">
            <LoadingButton
              onClick={handleResendConfirmation}
              className="w-full"
              loading={resendConfirmationMutation.isPending}
              loadingText="Reenviando..."
            >
              Reenviar Email de Confirmação
            </LoadingButton>

            <Link to="/login">
              <Button variant="outline" className="w-full">
                Voltar ao Login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground space-y-2">
        <p>Problemas com o email? Verifique sua pasta de spam.</p>
        <p>
          Email incorreto? {' '}
          <Link to="/signup" className="text-primary hover:underline">
            Criar nova conta
          </Link>
        </p>
      </div>
    </div>
  )
}