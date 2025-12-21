import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FormField, LoadingButton } from '@/components/forms'
import { useSignIn } from '@/hooks/use-auth'
import { signInSchema, type SignInInput } from '@/lib/validations'
import { APP_NAME } from '@/lib/constants'
import { useEffect } from 'react'
import { toast } from 'sonner'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const signIn = useSignIn()

  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: SignInInput) => {
    try {
      await signIn.mutateAsync(data)
      toast.success('Login realizado com sucesso!')

      // Redirect to the intended page or dashboard
      const from = location.state?.from?.pathname || '/dashboard'
      navigate(from, { replace: true })
    } catch (error: any) {
      console.error('Login error:', error)

      // Check for specific error codes first
      if (error.errorCode === 'EMAIL_NOT_VERIFIED') {
        navigate('/email-not-verified', {
          state: {
            email: data.email,
          },
        })
        return
      }

      const errorMessage = error.message || 'Erro ao fazer login'

      if (errorMessage.toLowerCase().includes('inválid') ||
          errorMessage.toLowerCase().includes('invalid')) {
        toast.error('Email ou senha incorretos')
      } else {
        toast.error(errorMessage)
      }
    }
  }

  // Show success message if redirected from password reset or signup
  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message)
      // Clear state to prevent duplicate toasts on re-renders (React StrictMode)
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">{APP_NAME}</h1>
        <p className="text-muted-foreground">
          Entre na sua conta para continuar
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Entrar</CardTitle>
          <CardDescription>
            Digite suas credenciais para acessar sua conta
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

              <FormField
                name="password"
                label="Senha"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
              />

              <LoadingButton
                type="submit"
                className="w-full"
                loading={signIn.isPending}
                loadingText="Entrando..."
              >
                Entrar
              </LoadingButton>
            </form>
          </FormProvider>

          <div className="mt-4 text-center text-sm">
            <Link
              to="/forgot-password"
              className="text-primary hover:underline"
            >
              Esqueceu sua senha?
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Não tem uma conta? </span>
        <Link
          to="/signup"
          className="text-primary hover:underline font-medium"
        >
          Cadastre-se aqui
        </Link>
      </div>
    </div>
  )
}