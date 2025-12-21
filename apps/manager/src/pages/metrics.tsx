import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { MetricsCard } from '../components/MetricsCard';
import type { Metrics } from '../types/manager.types';

export const MetricsPage = () => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['metrics'],
    queryFn: async () => {
      const response = await api.get<Metrics>('/manager/metrics');
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading metrics...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Unable to load metrics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Platform Metrics</h1>
        <p className="text-muted-foreground">
          Overview of authentication and user activity
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricsCard title="Total Users" value={metrics.totalUsers} />
        <MetricsCard title="Active Users" value={metrics.activeUsers} />
        <MetricsCard title="Locked Accounts" value={metrics.lockedAccounts} />
        <MetricsCard title="Recent Signups (7 days)" value={metrics.recentSignups} />
        <MetricsCard title="Recent Logins (24 hours)" value={metrics.recentLogins} />
      </div>
    </div>
  );
};
