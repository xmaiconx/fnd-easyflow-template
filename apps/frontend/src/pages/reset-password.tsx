import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField, LoadingButton } from '@/components/forms'
import { useResetPassword } from '@/hooks/use-auth'
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validations'
import { APP_NAME } from '@/lib/constants'
import { toast } from 'sonner'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const resetPassword = useResetPassword()
  const token = searchParams.get('token')

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!token) {
      toast.error('Token de recuperação inválido')
      return
    }

    try {
      // Remove confirmPassword before sending
      await resetPassword.mutateAsync({
        token,
        newPassword: data.newPassword,
      })
      // Navigate to login with success message (toast handled by LoginPage)
      navigate('/login', {
        state: {
          message: 'Senha redefinida com sucesso! Faça login com sua nova senha.',
        },
      })
    } catch (error: any) {
      console.error('Reset password error:', error)
      const message = error.message || 'Erro ao redefinir senha'

      if (message.toLowerCase().includes('expirado') ||
          message.toLowerCase().includes('expired')) {
        toast.error('Link expirado. Solicite um novo link de recuperação.')
      } else if (message.toLowerCase().includes('inválido') ||
                 message.toLowerCase().includes('invalid')) {
        toast.error('Link inválido. Solicite um novo link de recuperação.')
      } else {
        toast.error(message)
      }
    }
  }

  if (!token) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{APP_NAME}</h1>
          <p className="text-muted-foreground">Recuperação de Senha</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Link Inválido</CardTitle>
            <CardDescription>O link de recuperação não é válido</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              O link de recuperação de senha é inválido ou está faltando. Por favor, solicite um
              novo link.
            </p>
            <div className="flex gap-2">
              <Link to="/forgot-password" className="text-primary hover:underline">
                Solicitar novo link
              </Link>
              <span className="text-muted-foreground">ou</span>
              <Link to="/login" className="text-primary hover:underline">
                Voltar para Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{APP_NAME}</h1>
        <p className="text-muted-foreground">Redefinir Senha</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nova Senha</CardTitle>
          <CardDescription>Digite sua nova senha abaixo</CardDescription>
        </CardHeader>
        <CardContent>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                name="newPassword"
                label="Nova Senha"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                description="Mínimo de 6 caracteres"
              />

              <FormField
                name="confirmPassword"
                label="Confirmar Nova Senha"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
              />

              <LoadingButton
                type="submit"
                className="w-full"
                loading={resetPassword.isPending}
                loadingText="Redefinindo..."
              >
                Redefinir Senha
              </LoadingButton>
            </form>
          </FormProvider>

          <div className="mt-4 text-center text-sm">
            <Link to="/login" className="text-primary hover:underline">
              Voltar para Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
