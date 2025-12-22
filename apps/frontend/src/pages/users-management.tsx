"use client"

import * as React from "react"
import { Search, Plus, Users } from "lucide-react"
import { AppShell } from "@/components/layout/app-shell"
import { PageHeader } from "@/components/layout/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { UserTable } from "@/components/features/account-admin/user-table"
import { UserCard } from "@/components/features/account-admin/user-card"
import { UserDetailsSheet } from "@/components/features/account-admin/user-details-sheet"
import { PendingInvitesTable } from "@/components/features/account-admin/pending-invites-table"
import { InviteCard } from "@/components/features/account-admin/invite-card"
import { InviteDialog } from "@/components/features/account-admin/invite-dialog"
import { ActivityLog } from "@/components/features/account-admin/activity-log"
import {
  useAccountUsers,
  useAccountInvites,
  useResendInvite,
  useCancelInvite,
} from "@/hooks/use-account-admin"
import { useAuthStore } from "@/stores/auth-store"

export default function UsersManagementPage() {
  const [searchTerm, setSearchTerm] = React.useState("")
  const [selectedUserId, setSelectedUserId] = React.useState<string | null>(null)
  const [inviteDialogOpen, setInviteDialogOpen] = React.useState(false)

  const user = useAuthStore((state) => state.user)
  const workspaceList = useAuthStore((state) => state.workspaceList)

  const { data: users, isLoading: usersLoading } = useAccountUsers({ search: searchTerm })
  const { data: invites, isLoading: invitesLoading } = useAccountInvites({ status: 'pending' })
  const resendInvite = useResendInvite()
  const cancelInvite = useCancelInvite()

  const filteredUsers = users || []

  return (
    <AppShell currentPath="/settings/users" breadcrumb={["Configurações", "Usuários"]}>
      <div className="space-y-6">
        <PageHeader
          title="Gestão de Usuários"
          description="Gerencie usuários e permissões da conta"
        >
          <Button onClick={() => setInviteDialogOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Convidar Usuário</span>
            <span className="sm:hidden">Convidar</span>
          </Button>
        </PageHeader>

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="invites">Convites</TabsTrigger>
            <TabsTrigger value="activity">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar usuários..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 text-base"
                />
              </div>
            </div>

            {!usersLoading && filteredUsers.length === 0 ? (
              <EmptyState
                icon={Users}
                title="Nenhum usuário encontrado"
                description="Não há usuários cadastrados"
              />
            ) : (
              <>
                <div className="hidden md:block">
                  <UserTable
                    users={filteredUsers}
                    onUserClick={(userId) => setSelectedUserId(userId)}
                    isLoading={usersLoading}
                  />
                </div>

                <div className="md:hidden space-y-3">
                  {filteredUsers.map((user) => (
                    <UserCard
                      key={user.id}
                      user={user}
                      onClick={() => setSelectedUserId(user.id)}
                    />
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="invites" className="space-y-4">
            {!invitesLoading && (!invites || invites.length === 0) ? (
              <EmptyState
                icon={Users}
                title="Nenhum convite pendente"
                description="Não há convites aguardando aceitação"
              />
            ) : (
              <>
                <div className="hidden md:block">
                  <PendingInvitesTable
                    invites={invites || []}
                    onResend={(id) => resendInvite.mutate(id)}
                    onCancel={(id) => cancelInvite.mutate(id)}
                    isLoading={invitesLoading}
                  />
                </div>

                <div className="md:hidden space-y-3">
                  {(invites || []).map((invite) => (
                    <InviteCard
                      key={invite.id}
                      invite={invite}
                      onResend={() => resendInvite.mutate(invite.id)}
                      onCancel={() => cancelInvite.mutate(invite.id)}
                    />
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="activity">
            <ActivityLog />
          </TabsContent>
        </Tabs>

        <UserDetailsSheet
          userId={selectedUserId || ''}
          open={!!selectedUserId}
          onOpenChange={(open) => !open && setSelectedUserId(null)}
        />

        <InviteDialog
          open={inviteDialogOpen}
          onOpenChange={setInviteDialogOpen}
          workspaces={workspaceList}
          currentUserRole={user?.role as any || 'member'}
        />
      </div>
    </AppShell>
  )
}
