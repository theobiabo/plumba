import { Badge } from '@plumba/ui/components/badge';
import type { HostStatus, NodeStatus } from '../data/demo-workspace';

type Status = NodeStatus | HostStatus | 'planned' | 'preview';

const statusLabels: Record<Status, string> = {
  ready: 'Ready',
  running: 'Running',
  syncing: 'Syncing',
  stalled: 'Stalled',
  stopped: 'Stopped',
  disconnected: 'Disconnected',
  online: 'Online',
  offline: 'Offline',
  planned: 'Planned',
  preview: 'Preview',
};

interface StatusBadgeProps {
  status: Status;
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className="status-badge gap-1.5"
      data-status={status}
    >
      <span
        className="size-1.5 shrink-0 rounded-full bg-current"
        aria-hidden="true"
      />
      {label ?? statusLabels[status]}
    </Badge>
  );
}
