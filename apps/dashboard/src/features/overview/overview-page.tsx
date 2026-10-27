import {
  ArrowClockwise,
  ArrowRight,
  HardDrives,
  WarningCircle,
} from '@phosphor-icons/react';
import { Badge } from '@plumba/ui/components/badge';
import { Button } from '@plumba/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@plumba/ui/components/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@plumba/ui/components/empty';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@plumba/ui/components/table';
import { cn } from '@plumba/ui/lib/utils';
import { Link } from 'react-router-dom';
import { useWorkspace } from '../../app/use-workspace';
import { PageHeading } from '../../components/page-heading';
import { ResourceSparkline } from '../../components/resource-sparkline';
import { StatusBadge } from '../../components/status-badge';
import type {
  Host,
  NodeDeployment,
  StorageVolume,
} from '../../data/demo-workspace';
import { activityForHost } from '../../lib/activity';
import { formatPercent, formatStorage } from '../../lib/format';

interface AttentionIssue {
  id: string;
  title: string;
  detail: string;
  href: string;
  tone: 'warning' | 'error';
}

function usagePercent(used: number, total: number) {
  return total > 0 ? (used / total) * 100 : 0;
}

function average(values: number[]) {
  return values.length > 0
    ? values.reduce((total, value) => total + value, 0) / values.length
    : 0;
}

function averageHistory(
  hosts: Host[],
  key: 'cpuHistory' | 'memoryHistory' | 'diskHistory',
) {
  const length = Math.max(0, ...hosts.map((host) => host[key].length));
  return Array.from({ length }, (_, index) =>
    Math.round(
      average(hosts.map((host) => host[key][index] ?? host[key].at(-1) ?? 0)),
    ),
  );
}

function getAttentionIssues(
  hosts: Host[],
  nodes: NodeDeployment[],
  volumes: StorageVolume[],
): AttentionIssue[] {
  return [
    ...nodes
      .filter((node) => node.status === 'stalled')
      .map((node) => ({
        id: `stalled-${node.id}`,
        title: `${node.name} has stalled`,
        detail: `Sync ${formatPercent(node.syncPercent)} · Last update ${node.lastUpdate}`,
        href: `/nodes/${node.id}`,
        tone: 'warning' as const,
      })),
    ...hosts
      .filter((host) => host.status === 'offline')
      .map((host) => ({
        id: `offline-${host.id}`,
        title: `${host.name} is offline`,
        detail: `Last contact ${host.lastContact}`,
        href: '/hosts',
        tone: 'error' as const,
      })),
    ...nodes
      .filter((node) => node.status === 'disconnected')
      .map((node) => ({
        id: `disconnected-${node.id}`,
        title: `${node.name} is disconnected`,
        detail: `Last update ${node.lastUpdate}`,
        href: `/nodes/${node.id}`,
        tone: 'error' as const,
      })),
    ...volumes
      .filter((volume) => usagePercent(volume.usedGb, volume.capacityGb) >= 85)
      .map((volume) => ({
        id: `volume-${volume.id}`,
        title: `${volume.name} is nearly full`,
        detail: `${formatStorage(volume.capacityGb - volume.usedGb)} free`,
        href: '/storage',
        tone: 'warning' as const,
      })),
  ];
}

export function OverviewPage() {
  const {
    hosts,
    nodes,
    volumes,
    activity,
    selectedHostId,
    isRefreshing,
    refreshPreview,
  } = useWorkspace();
  const visibleHosts =
    selectedHostId === 'all'
      ? hosts
      : hosts.filter((host) => host.id === selectedHostId);
  const visibleNodes =
    selectedHostId === 'all'
      ? nodes
      : nodes.filter((node) => node.hostId === selectedHostId);
  const visibleVolumes =
    selectedHostId === 'all'
      ? volumes
      : volumes.filter((volume) => volume.hostId === selectedHostId);
  const visibleActivity = activityForHost(activity, selectedHostId);
  const onlineHosts = visibleHosts.filter((host) => host.status === 'online');
  const issues = getAttentionIssues(visibleHosts, visibleNodes, visibleVolumes);
  const scope =
    selectedHostId === 'all'
      ? 'All hosts'
      : (visibleHosts[0]?.name ?? 'Selected host');
  const nodeCounts = [
    {
      label: 'Running',
      count: visibleNodes.filter(
        (node) => node.status === 'ready' || node.status === 'running',
      ).length,
      detail: 'Ready or active',
    },
    {
      label: 'Syncing',
      count: visibleNodes.filter((node) => node.status === 'syncing').length,
      detail: 'Catching up',
    },
    {
      label: 'Stopped',
      count: visibleNodes.filter((node) => node.status === 'stopped').length,
      detail: 'Not running',
    },
    {
      label: 'Needs attention',
      count: visibleNodes.filter(
        (node) => node.status === 'stalled' || node.status === 'disconnected',
      ).length,
      detail: 'Stalled or disconnected',
    },
  ];
  const resourceMetrics = [
    {
      label: 'CPU',
      value: average(onlineHosts.map((host) => host.cpuPercent)),
      history: averageHistory(onlineHosts, 'cpuHistory'),
    },
    {
      label: 'Memory',
      value: average(
        onlineHosts.map((host) =>
          usagePercent(host.memoryUsedGb, host.memoryTotalGb),
        ),
      ),
      history: averageHistory(onlineHosts, 'memoryHistory'),
    },
    {
      label: 'Disk',
      value: average(
        onlineHosts.map((host) =>
          usagePercent(host.diskUsedGb, host.diskTotalGb),
        ),
      ),
      history: averageHistory(onlineHosts, 'diskHistory'),
    },
  ];

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-wrap items-start justify-between gap-4 [&_.page-heading]:mb-0">
        <PageHeading
          title="Overview"
          description="Monitor node health, host resources, and recent operations."
        />
        <Button
          variant="outline"
          size="sm"
          disabled={isRefreshing}
          onClick={() => void refreshPreview()}
        >
          <ArrowClockwise data-icon="inline-start" aria-hidden="true" />
          {isRefreshing ? 'Refreshing preview…' : 'Refresh preview'}
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span>{scope}</span>
        <span aria-hidden="true">/</span>
        <span>Sample data resets on reload</span>
      </div>

      <section
        className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]"
        aria-label="Workspace health"
      >
        <Card className="gap-0">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <CardTitle>
                <h2 className="text-base font-semibold tracking-tight">
                  Needs attention
                </h2>
              </CardTitle>
              <CardDescription>Issues across selected hosts.</CardDescription>
            </div>
            <Badge variant={issues.length > 0 ? 'secondary' : 'outline'}>
              {issues.length} {issues.length === 1 ? 'issue' : 'issues'}
            </Badge>
          </CardHeader>
          <CardContent className="divide-y divide-border py-0">
            {issues.length > 0 ? (
              issues.map((issue) => (
                <Link
                  key={issue.id}
                  to={issue.href}
                  className="group flex min-w-0 items-start gap-3 py-3 transition-colors hover:text-primary"
                >
                  <WarningCircle
                    className={cn(
                      'mt-0.5 shrink-0',
                      issue.tone === 'error'
                        ? 'text-destructive'
                        : 'text-primary',
                    )}
                    aria-hidden="true"
                  />
                  <span className="min-w-0">
                    <span className="block text-sm text-foreground">
                      {issue.title}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {issue.detail}
                    </span>
                  </span>
                  <ArrowRight
                    className="ml-auto mt-1 shrink-0 text-muted-foreground/60 transition-colors group-hover:text-primary"
                    aria-hidden="true"
                  />
                </Link>
              ))
            ) : (
              <Empty className="border-0 py-8">
                <EmptyHeader>
                  <EmptyTitle>Nothing needs attention</EmptyTitle>
                  <EmptyDescription>No issues in this view.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </CardContent>
          <CardFooter>
            <Button
              variant="link"
              size="sm"
              render={<Link to="/activity" />}
              nativeButton={false}
            >
              View activity{' '}
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="gap-0">
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div className="flex flex-col gap-1">
              <CardTitle>
                <h2 className="text-base font-semibold tracking-tight">
                  Host health
                </h2>
              </CardTitle>
              <CardDescription>Current host availability.</CardDescription>
            </div>
            <HardDrives className="text-muted-foreground" aria-hidden="true" />
          </CardHeader>
          <CardContent className="divide-y divide-border py-0">
            {visibleHosts.map((host) => (
              <Link
                key={host.id}
                to="/hosts"
                className="block py-3 transition-colors hover:text-primary"
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="truncate text-sm text-foreground">
                    {host.name}
                  </span>
                  <StatusBadge status={host.status} />
                </span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {host.status === 'online'
                    ? `${formatPercent(host.cpuPercent)} CPU · ${formatPercent(usagePercent(host.memoryUsedGb, host.memoryTotalGb))} memory · ${formatPercent(usagePercent(host.diskUsedGb, host.diskTotalGb))} disk`
                    : `Last contact ${host.lastContact}`}
                </span>
              </Link>
            ))}
          </CardContent>
          <CardFooter>
            <span className="text-xs text-muted-foreground">
              {onlineHosts.length} of {visibleHosts.length} online
            </span>
          </CardFooter>
        </Card>
      </section>

      <section
        aria-labelledby="node-summary-title"
        className="flex flex-col gap-4"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2
            id="node-summary-title"
            className="text-base font-semibold tracking-tight"
          >
            Node status
          </h2>
          <span className="text-xs text-muted-foreground">
            {visibleNodes.length} deployments
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {nodeCounts.map((metric) => (
            <Card key={metric.label} size="sm" className="gap-0">
              <CardHeader>
                <CardTitle>
                  <h3 className="text-xs text-muted-foreground">
                    {metric.label}
                  </h3>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-1">
                <p className="font-mono text-[26px] leading-none tabular-nums text-foreground">
                  {metric.count}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {metric.detail}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="resource-title" className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2
            id="resource-title"
            className="text-base font-semibold tracking-tight"
          >
            Resource usage
          </h2>
          <span className="text-xs text-muted-foreground">
            Average across online hosts
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {resourceMetrics.map((metric) => (
            <Card key={metric.label} size="sm" className="gap-0">
              <CardHeader className="flex flex-row items-center justify-between gap-3">
                <CardTitle>
                  <h3>{metric.label}</h3>
                </CardTitle>
                <span className="font-mono text-base tabular-nums text-foreground">
                  {onlineHosts.length > 0 ? formatPercent(metric.value) : '—'}
                </span>
              </CardHeader>
              <CardContent className="pt-3">
                {onlineHosts.length > 0 ? (
                  <ResourceSparkline
                    values={metric.history}
                    label={`${metric.label} sample usage`}
                    tone={
                      metric.value >= 95
                        ? 'critical'
                        : metric.value >= 85
                          ? 'warning'
                          : 'normal'
                    }
                  />
                ) : (
                  <p className="py-4 text-xs text-muted-foreground">
                    No online host data in this preview.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,1fr)]">
        <section aria-labelledby="nodes-title" className="min-w-0">
          <Card className="h-full min-w-0 gap-0">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <CardTitle>
                  <h2
                    id="nodes-title"
                    className="text-base font-semibold tracking-tight"
                  >
                    Nodes
                  </h2>
                </CardTitle>
                <CardDescription>
                  Deployment health and sync state.
                </CardDescription>
              </div>
              <Button
                variant="link"
                size="sm"
                render={<Link to="/nodes" />}
                nativeButton={false}
              >
                View all{' '}
                <ArrowRight data-icon="inline-end" aria-hidden="true" />
              </Button>
            </CardHeader>
            <CardContent className="overflow-x-auto px-0">
              {visibleNodes.length > 0 ? (
                <Table
                  className="min-w-[680px]"
                  aria-label="Sample node deployments"
                >
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-4">Node</TableHead>
                      <TableHead>Network</TableHead>
                      <TableHead>Host</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Sync</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {visibleNodes.map((node) => (
                      <TableRow key={node.id}>
                        <TableCell className="pl-4 font-medium">
                          <Link
                            to={`/nodes/${node.id}`}
                            className="hover:text-primary"
                          >
                            {node.name}
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {node.chain} · {node.network}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {hosts.find((host) => host.id === node.hostId)
                            ?.name ?? 'Unknown'}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={node.status} />
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatPercent(node.syncPercent)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Empty className="border-0 py-12">
                  <EmptyHeader>
                    <EmptyTitle>No nodes in this view</EmptyTitle>
                    <EmptyDescription>
                      Choose another host or explore the sample catalog.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="recent-activity-title" className="min-w-0">
          <Card className="h-full min-w-0 gap-0">
            <CardHeader className="flex flex-row items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <CardTitle>
                  <h2
                    id="recent-activity-title"
                    className="text-base font-semibold tracking-tight"
                  >
                    Recent activity
                  </h2>
                </CardTitle>
                <CardDescription>
                  Latest operations and status changes.
                </CardDescription>
              </div>
              <Button
                variant="link"
                size="sm"
                render={<Link to="/activity" />}
                nativeButton={false}
              >
                View all{' '}
                <ArrowRight data-icon="inline-end" aria-hidden="true" />
              </Button>
            </CardHeader>
            <CardContent className="divide-y divide-border py-0">
              {visibleActivity.slice(0, 4).map((event) => (
                <div key={event.id} className="py-3">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm text-foreground">{event.title}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {event.time}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {event.description}
                  </p>
                </div>
              ))}
              {visibleActivity.length === 0 && (
                <Empty className="border-0 py-8">
                  <EmptyHeader>
                    <EmptyTitle>No recent activity</EmptyTitle>
                    <EmptyDescription>
                      No events are associated with this sample host.
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
