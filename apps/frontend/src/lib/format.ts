// Date formatting utilities
export const formatDate = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleDateString('pt-BR')
}

export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleString('pt-BR')
}

export const formatTime = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Currency formatting
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

// Phone formatting
export const formatPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{2})(\d{4,5})(\d{4})$/)
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`
  }
  return phone
}

// CPF formatting
export const formatCPF = (cpf: string): string => {
  const cleaned = cpf.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{2})$/)
  if (match) {
    return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`
  }
  return cpf
}

// Text utilities
export const truncate = (text: string, length: number): string => {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}