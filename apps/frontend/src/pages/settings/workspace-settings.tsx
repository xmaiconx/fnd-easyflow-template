import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Loader2, Archive, RotateCcw, Trash2, ChevronLeft } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useWorkspace } from '@/hooks/use-workspace'
import { toast } from 'sonner'
import { ROUTES } from '@/lib/constants'

const updateWorkspaceSchema = z.object({
  name: z
    .string()
    .min(3, 'Workspace name must be at least 3 characters')
    .max(50, 'Workspace name must be at most 50 characters'),
})

type UpdateWorkspaceFormData = z.infer<typeof updateWorkspaceSchema>

export function WorkspaceSettingsPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>()
  const navigate = useNavigate()
  const { useWorkspaceById, updateWorkspace, archiveWorkspace, restoreWorkspace, deleteWorkspace } = useWorkspace()

  const { data: workspace, isLoading } = useWorkspaceById(workspaceId)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<UpdateWorkspaceFormData>({
    resolver: zodResolver(updateWorkspaceSchema),
    values: {
      name: workspace?.name || '',
    },
  })

  const onSubmit = async (data: UpdateWorkspaceFormData) => {
    if (!workspaceId) return

    updateWorkspace(
      { id: workspaceId, data },
      {
        onSuccess: () => {
          toast.success('Workspace updated successfully')
        },
        onError: (error: any) => {
          const message = error?.response?.data?.message || 'Failed to update workspace'
          toast.error(message)
        },
      }
    )
  }

  const handleArchive = () => {
    if (!workspaceId) return

    archiveWorkspace(
      { id: workspaceId },
      {
        onSuccess: () => {
          toast.success('Workspace archived successfully')
          navigate(ROUTES.SETTINGS_WORKSPACES)
        },
        onError: (error: any) => {
          const message = error?.response?.data?.message || 'Failed to archive workspace'
          toast.error(message)
        },
      }
    )
  }

  const handleRestore = () => {
    if (!workspaceId) return

    restoreWorkspace(workspaceId, {
      onSuccess: () => {
        toast.success('Workspace restored successfully')
        navigate(ROUTES.SETTINGS_WORKSPACES)
      },
      onError: (error: any) => {
        const message = error?.response?.data?.message || 'Failed to restore workspace'
        toast.error(message)
      },
    })
  }

  const handleDelete = () => {
    if (!workspaceId) return
    if (deleteConfirmation !== workspace?.name) {
      toast.error('Please type the workspace name correctly to confirm deletion')
      return
    }

    deleteWorkspace(workspaceId, {
      onSuccess: () => {
        toast.success('Workspace scheduled for deletion in 30 days')
        setDeleteDialogOpen(false)
        navigate(ROUTES.SETTINGS_WORKSPACES)
      },
      onError: (error: any) => {
        const message = error?.response?.data?.message || 'Failed to delete workspace'
        toast.error(message)
      },
    })
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!workspace) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">Workspace not found</p>
          <Button onClick={() => navigate(ROUTES.SETTINGS_WORKSPACES)} variant="outline" className="mt-4">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Workspaces
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto p-6">
      {/* Header */}
      <div>
        <Button onClick={() => navigate(ROUTES.SETTINGS_WORKSPACES)} variant="ghost" className="mb-4">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Workspaces
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold">Workspace Settings</h1>
        <p className="text-muted-foreground mt-1">Manage workspace details and lifecycle</p>
      </div>

      {/* Workspace Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Workspace Details</CardTitle>
          <CardDescription>Update your workspace name and settings</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Workspace Name</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Created At</Label>
              <p className="text-sm text-muted-foreground">{new Date(workspace.createdAt).toLocaleDateString()}</p>
            </div>

            <div className="space-y-2">
              <Label>Onboarding Status</Label>
              <p className="text-sm text-muted-foreground capitalize">{workspace.onboardingStatus}</p>
            </div>

            <Button type="submit" disabled={!isDirty}>
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* Lifecycle Management Card */}
      <Card>
        <CardHeader>
          <CardTitle>Workspace Lifecycle</CardTitle>
          <CardDescription>Archive, restore, or delete this workspace</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {workspace.status === 'active' && (
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium">Archive Workspace</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Temporarily disable this workspace. You can restore it later.
                </p>
              </div>
              <Button onClick={handleArchive} variant="outline">
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </Button>
            </div>
          )}

          {workspace.status === 'archived' && (
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium">Restore Workspace</h4>
                <p className="text-sm text-muted-foreground mt-1">Reactivate this archived workspace.</p>
              </div>
              <Button onClick={handleRestore} variant="outline">
                <RotateCcw className="mr-2 h-4 w-4" />
                Restore
              </Button>
            </div>
          )}

          <Separator />

          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-medium text-destructive">Delete Workspace</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Permanently delete this workspace after 30-day grace period. This action cannot be undone.
              </p>
            </div>
            <Button onClick={() => setDeleteDialogOpen(true)} variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This workspace will be scheduled for deletion in <strong>30 days</strong>. All associated data will be
              permanently deleted after this period.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="delete-confirm">Type the workspace name to confirm:</Label>
            <Input
              id="delete-confirm"
              placeholder={workspace.name}
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setDeleteDialogOpen(false)
              setDeleteConfirmation('')
            }}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteConfirmation !== workspace.name}
            >
              Delete Workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
