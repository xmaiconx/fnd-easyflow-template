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
import { useAuthStore } from '@/stores/auth-store'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const signInMutation = useSignIn()
  const clearAuth = useAuthStore(state => state.clearAuth)

  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (data: SignInInput) => {
    try {
      await signInMutation.mutateAsync(data)
      toast.success('Login realizado com sucesso!')

      // Redirect to the intended page or dashboard
      const from = location.state?.from?.pathname || '/dashboard'
      navigate(from, { replace: true })
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao fazer login'

      // Check if the error is about unverified email
      if (message.includes('Email não verificado') || message.includes('verificado')) {
        // Clear any residual auth state before redirecting
        clearAuth()

        // Redirect to email not verified page
        navigate('/email-not-verified', {
          state: {
            email: data.email,
          },
        })
      } else {
        toast.error(message)
      }
    }
  }

  // Show success message if redirected from signup
  useEffect(() => {
    if (location.state?.message) {
      toast.success(location.state.message)
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
                loading={signInMutation.isPending}
                loadingText="Entrando..."
              >
                Entrar
              </LoadingButton>
            </form>
          </FormProvider>
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