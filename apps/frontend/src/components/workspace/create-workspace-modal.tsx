import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useWorkspace } from '@/hooks/use-workspace'
import { useAuthStore } from '@/stores/auth-store'
import { toast } from 'sonner'

const createWorkspaceSchema = z.object({
  name: z
    .string()
    .min(3, 'Workspace name must be at least 3 characters')
    .max(50, 'Workspace name must be at most 50 characters')
    .regex(
      /^[a-zA-Z0-9\s\-_]+$/,
      'Workspace name can only contain letters, numbers, spaces, hyphens, and underscores'
    ),
})

type CreateWorkspaceFormData = z.infer<typeof createWorkspaceSchema>

interface CreateWorkspaceModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateWorkspaceModal({ open, onOpenChange }: CreateWorkspaceModalProps) {
  const { user } = useAuthStore()
  const { createWorkspace, isCreatingWorkspace, switchWorkspace } = useWorkspace()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateWorkspaceFormData>({
    resolver: zodResolver(createWorkspaceSchema),
  })

  const onSubmit = async (data: CreateWorkspaceFormData) => {
    if (!user?.accountId) {
      toast.error('User not authenticated')
      return
    }

    createWorkspace(
      {
        accountId: user.accountId,
        name: data.name,
      },
      {
        onSuccess: (newWorkspace) => {
          toast.success(`Workspace "${newWorkspace.name}" created successfully`)
          reset()
          onOpenChange(false)

          // Switch to new workspace and redirect to onboarding
          switchWorkspace(newWorkspace)
        },
        onError: (error: any) => {
          const message = error?.response?.data?.message || 'Failed to create workspace'
          toast.error(message)
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Workspace</DialogTitle>
          <DialogDescription>
            Create a new workspace to manage separate projects or clients. Each workspace has its own settings and
            content.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Workspace Name</Label>
            <Input
              id="name"
              placeholder="e.g., My Project"
              {...register('name')}
              disabled={isCreatingWorkspace}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isCreatingWorkspace}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isCreatingWorkspace}>
              {isCreatingWorkspace && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Workspace
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
