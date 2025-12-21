import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField, LoadingButton } from '@/components/forms'
import { useForgotPassword } from '@/hooks/use-auth'
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validations'
import { APP_NAME } from '@/lib/constants'
import { toast } from 'sonner'
import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'

export function ForgotPasswordPage() {
  const forgotPassword = useForgotPassword()
  const [emailSent, setEmailSent] = useState(false)

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      await forgotPassword.mutateAsync(data)
      setEmailSent(true)
      toast.success('Email de recuperação enviado!')
    } catch (error: any) {
      console.error('Forgot password error:', error)
      const message = error.message || 'Erro ao enviar email de recuperação'
      toast.error(message)
    }
  }

  if (emailSent) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{APP_NAME}</h1>
          <p className="text-muted-foreground">Recuperação de Senha</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Email Enviado</CardTitle>
            <CardDescription>Verifique sua caixa de entrada</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <p className="text-lg font-medium text-center">
                Enviamos um link de recuperação para seu email
              </p>
              <p className="text-muted-foreground text-center">
                Clique no link recebido para redefinir sua senha. O link expira em 1 hora.
              </p>
              <div className="mt-4 text-center text-sm">
                <Link to="/login" className="text-primary hover:underline">
                  Voltar para Login
                </Link>
              </div>
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
        <p className="text-muted-foreground">Recuperação de Senha</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Esqueceu sua senha?</CardTitle>
          <CardDescription>
            Digite seu email para receber um link de recuperação
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                name="email"
                label="Email"
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
              />

              <LoadingButton
                type="submit"
                className="w-full"
                loading={forgotPassword.isPending}
                loadingText="Enviando..."
              >
                Enviar Link de Recuperação
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
