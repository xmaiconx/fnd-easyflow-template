import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { useImpersonate } from '../hooks/use-impersonate';

interface ImpersonateDialogProps {
  userId: string;
}

export const ImpersonateDialog = ({ userId }: ImpersonateDialogProps) => {
  const [reason, setReason] = useState('');
  const [open, setOpen] = useState(false);
  const { start, isStarting } = useImpersonate();

  const handleImpersonate = () => {
    start(
      { targetUserId: userId, reason },
      {
        onSuccess: () => {
          setOpen(false);
          setReason('');
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Impersonate User</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Impersonate User</DialogTitle>
          <DialogDescription>
            This action will open a new window with the user's session. Please provide a reason for this action.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (minimum 10 characters)</Label>
            <Textarea
              id="reason"
              placeholder="Enter reason for impersonation..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isStarting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleImpersonate}
            disabled={reason.length < 10 || isStarting}
          >
            {isStarting ? 'Starting...' : 'Start Impersonation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
