import { useParams, useNavigate } from 'react-router-dom';
import { useUserDetails } from '../hooks/use-manager-users';
import { useManagerUsers } from '../hooks/use-manager-users';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { UserStatusBadge } from '../components/UserStatusBadge';
import { ImpersonateDialog } from '../components/ImpersonateDialog';

export const UserDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: user, isLoading } = useUserDetails(id!);
  const { updateStatus, isUpdating } = useManagerUsers({});

  const handleToggleStatus = () => {
    if (!user) return;
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    updateStatus({ userId: user.id, status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate('/users')}>
          Back to Users
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Basic user account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="text-lg">{user.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="text-lg">{user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div className="mt-1">
                  <UserStatusBadge status={user.status} />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Email Verified</p>
                <p className="text-lg">{user.emailVerified ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Account ID</p>
                <p className="text-sm font-mono">{user.accountId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">User ID</p>
                <p className="text-sm font-mono">{user.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created At</p>
                <p className="text-lg">{new Date(user.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Login</p>
                <p className="text-lg">
                  {user.lastLoginAt
                    ? new Date(user.lastLoginAt).toLocaleString()
                    : 'Never'}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button
              variant={user.status === 'active' ? 'destructive' : 'default'}
              onClick={handleToggleStatus}
              disabled={isUpdating}
            >
              {isUpdating
                ? 'Updating...'
                : user.status === 'active'
                ? 'Deactivate User'
                : 'Activate User'}
            </Button>
            <ImpersonateDialog userId={user.id} />
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Workspaces</CardTitle>
            <CardDescription>User workspace memberships</CardDescription>
          </CardHeader>
          <CardContent>
            {user.workspaces.length > 0 ? (
              <ul className="space-y-2">
                {user.workspaces.map((workspace) => (
                  <li key={workspace.id} className="flex items-center gap-2 p-3 border rounded-md">
                    <div>
                      <p className="font-medium">{workspace.name}</p>
                      <p className="text-sm text-muted-foreground font-mono">{workspace.id}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No workspaces</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Sessions</CardTitle>
            <CardDescription>Current user sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {user.activeSessions.length > 0 ? (
              <ul className="space-y-2">
                {user.activeSessions.map((session) => (
                  <li key={session.id} className="flex items-center gap-2 p-3 border rounded-md">
                    <div className="flex-1">
                      <p className="font-medium">{session.deviceName || 'Unknown Device'}</p>
                      <p className="text-sm text-muted-foreground">IP: {session.ipAddress}</p>
                      <p className="text-sm text-muted-foreground">
                        Last Activity: {new Date(session.lastActivityAt).toLocaleString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No active sessions</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
