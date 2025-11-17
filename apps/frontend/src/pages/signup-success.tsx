import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingButton } from '@/components/forms'
import { CheckCircle2, Mail, Clock } from 'lucide-react'
import { APP_NAME } from '@/lib/constants'
import { useResendConfirmation } from '@/hooks/use-auth'
import { toast } from 'sonner'

export function SignUpSuccessPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState<string>('')
  const resendConfirmationMutation = useResendConfirmation()

  useEffect(() => {
    // Get email from location state or redirect to signup
    if (location.state?.email) {
      setEmail(location.state.email)
    } else {
      navigate('/signup', { replace: true })
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
    return null // Will redirect to signup
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{APP_NAME}</h1>
        <p className="text-muted-foreground">
          Conta criada com sucesso
        </p>
      </div>

      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
          </div>
          <CardTitle className="text-green-900">Conta Criada!</CardTitle>
          <CardDescription>
            Sua conta foi criada com sucesso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span>Email enviado para:</span>
            </div>
            <div className="font-medium text-center">{email}</div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-blue-800">
              <Clock className="w-4 h-4" />
              <span className="font-medium text-sm">Próximo passo</span>
            </div>
            <p className="text-sm text-blue-700">
              Verifique sua caixa de entrada e clique no link de confirmação.
              O link é válido por <strong>24 horas</strong>.
            </p>
          </div>

          <div className="space-y-3">
            <LoadingButton
              onClick={handleResendConfirmation}
              variant="outline"
              className="w-full"
              loading={resendConfirmationMutation.isPending}
              loadingText="Reenviando..."
            >
              Reenviar Email
            </LoadingButton>

            <Link to="/login">
              <Button variant="ghost" className="w-full">
                Ir para Login
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm text-muted-foreground">
        <p>Não recebeu o email? Verifique sua pasta de spam ou lixo eletrônico.</p>
      </div>
    </div>
  )
}