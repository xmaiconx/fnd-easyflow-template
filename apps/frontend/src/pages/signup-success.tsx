import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Mail, RefreshCw } from 'lucide-react'
import { APP_NAME } from '@/lib/constants'
import { useResendVerification } from '@/hooks/use-auth'
import { toast } from 'sonner'

export function SignUpSuccessPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState<string>('')
  const [cooldown, setCooldown] = useState<number>(0)
  const resendVerification = useResendVerification()

  useEffect(() => {
    // Get email from location state or redirect to signup
    if (location.state?.email) {
      setEmail(location.state.email)
    } else {
      navigate('/signup', { replace: true })
    }
  }, [location.state, navigate])

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  const handleResendEmail = async () => {
    if (cooldown > 0 || !email) return

    try {
      await resendVerification.mutateAsync({ email })
      toast.success('Email de verificação reenviado com sucesso!')
      setCooldown(60) // 60 seconds cooldown
    } catch (error: any) {
      toast.error(error.message || 'Erro ao reenviar email')
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
          <div className="mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <CardTitle>Conta criada!</CardTitle>
          <CardDescription>
            Enviamos um link de verificação para seu email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-center gap-2 py-3 px-4 bg-muted rounded-lg">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{email}</span>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Verifique sua caixa de entrada (incluindo spam). O link é válido por 24 horas.
          </p>

          <div className="space-y-3">
            <Link to="/login">
              <Button className="w-full">
                Ir para Login
              </Button>
            </Link>

            <div className="text-center">
              <span className="text-sm text-muted-foreground">Não recebeu? </span>
              <Button
                variant="link"
                className="p-0 h-auto text-sm"
                onClick={handleResendEmail}
                disabled={cooldown > 0 || resendVerification.isPending}
              >
                {resendVerification.isPending ? (
                  <>
                    <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                    Reenviando...
                  </>
                ) : cooldown > 0 ? (
                  `Aguarde ${cooldown}s`
                ) : (
                  'Reenviar email'
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
