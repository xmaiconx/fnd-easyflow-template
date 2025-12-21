import { Badge } from './ui/badge';

interface UserStatusBadgeProps {
  status: 'active' | 'inactive';
}

export const UserStatusBadge = ({ status }: UserStatusBadgeProps) => {
  const variant = status === 'active' ? 'default' : 'secondary';

  return (
    <Badge variant={variant}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};
