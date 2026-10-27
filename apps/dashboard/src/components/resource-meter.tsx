import { Progress, ProgressLabel } from '@plumba/ui/components/progress';
import { formatPercent } from '../lib/format';

interface ResourceMeterProps {
  label: string;
  value: number;
  detail?: string;
  warningAt?: number;
}

export function ResourceMeter({
  label,
  value,
  detail,
  warningAt = 85,
}: ResourceMeterProps) {
  return (
    <Progress
      value={Math.min(100, Math.max(0, value))}
      className="resource-meter"
      data-warning={value >= warningAt}
    >
      <ProgressLabel>{label}</ProgressLabel>
      <span className="ml-auto font-mono text-xs text-muted-foreground">
        {detail ?? formatPercent(value)}
      </span>
    </Progress>
  );
}
