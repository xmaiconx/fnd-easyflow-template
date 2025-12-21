import { useAuthStore } from '@/stores/auth-store'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { AlertTriangle } from 'lucide-react'

export function ImpersonateBanner() {
  const { impersonateData, setImpersonate } = useAuthStore()

  if (!impersonateData) return null

  const handleEndImpersonation = async () => {
    try {
      await api.delete('/manager/impersonate')
      setImpersonate(null)
      toast.success('Impersonação finalizada')
      // Reload to clear the impersonated user session
      window.location.reload()
    } catch (error) {
      console.error('Error ending impersonation:', error)
      toast.error('Erro ao finalizar impersonação')
    }
  }

  const formatExpiresAt = (dateString: string | undefined) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'N/A'
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date)
    } catch {
      return 'N/A'
    }
  }

  return (
    <div className="bg-yellow-500 text-black px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5" />
        <span className="font-medium">
          Você está impersonando um usuário
        </span>
        <span className="text-sm opacity-90">
          (Expira em: {formatExpiresAt((impersonateData as any).expiresAt)})
        </span>
      </div>
      <Button
        variant="secondary"
        size="sm"
        onClick={handleEndImpersonation}
        className="bg-black text-white hover:bg-gray-800"
      >
        Finalizar Impersonação
      </Button>
    </div>
  )
}
