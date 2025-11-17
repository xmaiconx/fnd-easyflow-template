import { z } from 'zod'

export const signInSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email deve ser válido'),
  password: z
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

export const signUpSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email deve ser válido'),
  password: z
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres'),
  confirmPassword: z
    .string()
    .min(1, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
})

export const confirmEmailSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
})

export const resendConfirmationSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email deve ser válido'),
})

export type SignInInput = z.infer<typeof signInSchema>
export type SignUpInput = z.infer<typeof signUpSchema>
export type ConfirmEmailInput = z.infer<typeof confirmEmailSchema>
export type ResendConfirmationInput = z.infer<typeof resendConfirmationSchema>