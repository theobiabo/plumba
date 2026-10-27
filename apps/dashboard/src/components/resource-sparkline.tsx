interface ResourceSparklineProps {
  values: number[];
  label: string;
  tone?: 'normal' | 'warning' | 'critical';
}

export function ResourceSparkline({
  values,
  label,
  tone = 'normal',
}: ResourceSparklineProps) {
  return (
    <div
      className="resource-sparkline flex h-12 items-end gap-0.5"
      role="img"
      aria-label={`${label} history, latest ${Math.round(values.at(-1) ?? 0)} percent`}
      data-tone={tone}
    >
      {values.map((value, index) => (
        <span
          key={index}
          className="min-w-0 flex-1 rounded-[1px] bg-current opacity-70"
          style={{ height: `${Math.max(3, Math.min(100, value))}%` }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
