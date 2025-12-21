"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingButton } from "@/components/ui/loading-button"
import { AlertCircle } from "lucide-react"
import { useAuthStore } from "@/stores/auth-store"

const signupSchema = z
  .object({
    fullName: z.string().min(2, "Nome deve ter no mínimo 2 caracteres"),
    email: z.string().email("Email inválido"),
    password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
    confirmPassword: z.string().min(1, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Senhas não coincidem",
    path: ["confirmPassword"],
  })

type SignupFormData = z.infer<typeof signupSchema>

export function SignupForm() {
  const navigate = useNavigate()
  const signup = useAuthStore((state) => state.signup)
  const [error, setError] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setFocus,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  // Auto-focus first input
  React.useEffect(() => {
    setFocus("fullName")
  }, [setFocus])

  const onSubmit = async (data: SignupFormData) => {
    try {
      setError(null)
      await signup({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      })
      toast.success("Conta criada com sucesso!")
      navigate("/email-not-verified")
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.message ||
        "Erro ao criar conta. Tente novamente."
      setError(message)
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4"
    >
      {/* Full Name Field */}
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-sm font-medium">
          Nome completo
        </Label>
        <Input
          id="fullName"
          type="text"
          placeholder="João Silva"
          className="h-11 text-base"
          {...register("fullName", {
            onChange: () => setError(null),
          })}
        />
        {errors.fullName && (
          <p className="text-xs text-destructive">{errors.fullName.message}</p>
        )}
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="seu@email.com"
          className="h-11 text-base"
          {...register("email", {
            onChange: () => setError(null),
          })}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">
          Senha
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          className="h-11 text-base"
          {...register("password", {
            onChange: () => setError(null),
          })}
        />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-sm font-medium">
          Confirmar senha
        </Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          className="h-11 text-base"
          {...register("confirmPassword", {
            onChange: () => setError(null),
          })}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <LoadingButton
        type="submit"
        loading={isSubmitting}
        className="w-full h-11"
      >
        Criar conta
      </LoadingButton>

      {/* Links */}
      <div className="text-center">
        <a
          href="/login"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Já tem uma conta? <span className="text-primary">Entrar</span>
        </a>
      </div>
    </motion.form>
  )
}

SignupForm.displayName = "SignupForm"
