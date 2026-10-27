import {
  ArrowRight,
  Cpu,
  HardDrives,
  MagnifyingGlass,
  Warning,
} from '@phosphor-icons/react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@plumba/ui/components/alert';
import { Button } from '@plumba/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@plumba/ui/components/card';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@plumba/ui/components/empty';
import { Field, FieldGroup, FieldLabel } from '@plumba/ui/components/field';
import { Input } from '@plumba/ui/components/input';
import {
  NativeSelect,
  NativeSelectOption,
} from '@plumba/ui/components/native-select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@plumba/ui/components/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@plumba/ui/components/table';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeading } from '../../components/page-heading';
import { ResourceMeter } from '../../components/resource-meter';
import { ResourceSparkline } from '../../components/resource-sparkline';
import { StatusBadge } from '../../components/status-badge';
import { formatStorage } from '../../lib/format';
import { useWorkspace } from '../../app/use-workspace';

export function HostsPage() {
  const { hosts, nodes, volumes, selectedHostId, setSelectedHostId } =
    useWorkspace();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [detailHostId, setDetailHostId] = useState<string | null>(null);
  const scopedHosts = hosts.filter(
    (host) => selectedHostId === 'all' || host.id === selectedHostId,
  );
  const scopedVolumes = volumes.filter(
    (volume) => selectedHostId === 'all' || volume.hostId === selectedHostId,
  );

  const filteredHosts = scopedHosts.filter((host) => {
    const matchesStatus =
      statusFilter === 'all' || host.status === statusFilter;
    const matchesQuery = `${host.name} ${host.address} ${host.architecture}`
      .toLowerCase()
      .includes(query.trim().toLowerCase());
    return matchesStatus && matchesQuery;
  });
  const detailHost = hosts.find((host) => host.id === detailHostId);
  const onlineHosts = scopedHosts.filter((host) => host.status === 'online');
  const lowSpaceVolumes = scopedVolumes.filter(
    (volume) => (volume.capacityGb - volume.usedGb) / volume.capacityGb < 0.15,
  );

  return (
    <>
      <PageHeading
        title="Hosts"
        description="Machines running the Plumba agent, with capacity and contact status in one view."
      />

      {lowSpaceVolumes.length > 0 && (
        <Alert>
          <Warning aria-hidden="true" />
          <AlertTitle>Storage needs attention</AlertTitle>
          <AlertDescription>
            {lowSpaceVolumes.map((volume) => volume.name).join(', ')} has less
            than 15% free space. <Link to="/storage">Review storage</Link>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card size="sm">
          <CardHeader>
            <CardDescription>Connected hosts</CardDescription>
            <CardTitle className="font-mono text-xl">
              {onlineHosts.length} / {scopedHosts.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>Available compute</CardDescription>
            <CardTitle className="font-mono text-xl">
              {onlineHosts.reduce((sum, host) => sum + host.cpuCores, 0)} cores
            </CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm" className="col-span-2 sm:col-span-1">
          <CardHeader>
            <CardDescription>Total free storage</CardDescription>
            <CardTitle className="font-mono text-xl">
              {formatStorage(
                scopedVolumes.reduce(
                  (sum, volume) => sum + volume.capacityGb - volume.usedGb,
                  0,
                ),
              )}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="gap-3 border-b border-border pb-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="flex flex-col gap-1">
            <CardTitle>Host inventory</CardTitle>
            <CardDescription>
              Sample machine data for the interface preview.
            </CardDescription>
          </div>
          <FieldGroup className="flex flex-col gap-2 sm:flex-row">
            <Field>
              <FieldLabel htmlFor="host-search" className="sr-only">
                Search hosts
              </FieldLabel>
              <div className="relative">
                <MagnifyingGlass
                  className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
                  size={15}
                  aria-hidden="true"
                />
                <Input
                  id="host-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search hosts"
                  className="w-full pl-8 sm:w-[210px]"
                />
              </div>
            </Field>
            <Field>
              <FieldLabel htmlFor="host-status-filter" className="sr-only">
                Filter host status
              </FieldLabel>
              <NativeSelect
                id="host-status-filter"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="w-full sm:w-[125px]"
              >
                <NativeSelectOption value="all">
                  All statuses
                </NativeSelectOption>
                <NativeSelectOption value="online">Online</NativeSelectOption>
                <NativeSelectOption value="offline">Offline</NativeSelectOption>
              </NativeSelect>
            </Field>
          </FieldGroup>
        </CardHeader>
        <CardContent className="overflow-x-auto pt-2">
          {filteredHosts.length === 0 ? (
            <Empty className="min-h-52 border border-dashed border-border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <HardDrives aria-hidden="true" />
                </EmptyMedia>
                <EmptyTitle>No hosts match</EmptyTitle>
                <EmptyDescription>
                  Try another search or status filter.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuery('');
                    setStatusFilter('all');
                    setSelectedHostId('all');
                  }}
                >
                  Clear filters
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Host</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Architecture</TableHead>
                  <TableHead>CPU</TableHead>
                  <TableHead>Memory</TableHead>
                  <TableHead>Free disk</TableHead>
                  <TableHead>Last contact</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHosts.map((host) => (
                  <TableRow key={host.id}>
                    <TableCell>
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 font-mono"
                        onClick={() => setDetailHostId(host.id)}
                      >
                        {host.name}{' '}
                        <ArrowRight data-icon="inline-end" aria-hidden="true" />
                      </Button>
                      <div className="font-mono text-[11px] text-muted-foreground">
                        {host.address}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={host.status} />
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {host.architecture}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {host.status === 'online'
                        ? `${host.cpuPercent}%`
                        : 'Unavailable'}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {host.status === 'online'
                        ? `${host.memoryUsedGb} / ${host.memoryTotalGb} GB`
                        : 'Unavailable'}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {formatStorage(host.diskTotalGb - host.diskUsedGb)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {host.lastContact}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Sheet
        open={detailHost !== undefined}
        onOpenChange={(open) => !open && setDetailHostId(null)}
      >
        <SheetContent
          side="right"
          className="w-full max-w-[520px] overflow-y-auto p-0"
          showCloseButton
        >
          {detailHost && (
            <>
              <SheetHeader className="border-b border-border px-6 py-5">
                <SheetTitle className="font-mono text-lg">
                  {detailHost.name}
                </SheetTitle>
                <SheetDescription>
                  {detailHost.address} · {detailHost.architecture} · last
                  contact {detailHost.lastContact}
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-6 px-6 py-6">
                <div className="flex items-center justify-between">
                  <StatusBadge status={detailHost.status} />
                  <span className="text-xs text-muted-foreground">
                    {
                      nodes.filter((node) => node.hostId === detailHost.id)
                        .length
                    }{' '}
                    nodes
                  </span>
                </div>
                {detailHost.status === 'offline' && (
                  <Alert variant="destructive">
                    <Warning aria-hidden="true" />
                    <AlertTitle>Host is unreachable</AlertTitle>
                    <AlertDescription>
                      Live metrics and operations require the agent to
                      reconnect.
                    </AlertDescription>
                  </Alert>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <Card size="sm">
                    <CardHeader>
                      <CardDescription>CPU load</CardDescription>
                      <CardTitle className="font-mono text-lg">
                        {detailHost.status === 'online'
                          ? `${detailHost.cpuPercent}%`
                          : '—'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResourceSparkline
                        values={detailHost.cpuHistory}
                        label={`${detailHost.name} CPU`}
                      />
                    </CardContent>
                  </Card>
                  <Card size="sm">
                    <CardHeader>
                      <CardDescription>Memory</CardDescription>
                      <CardTitle className="font-mono text-lg">
                        {detailHost.memoryUsedGb} GB
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResourceSparkline
                        values={detailHost.memoryHistory}
                        label={`${detailHost.name} memory`}
                      />
                    </CardContent>
                  </Card>
                </div>
                <div className="flex flex-col gap-4 border border-border bg-muted/30 p-4">
                  <ResourceMeter
                    label="Disk used"
                    value={
                      (detailHost.diskUsedGb / detailHost.diskTotalGb) * 100
                    }
                    detail={`${formatStorage(detailHost.diskUsedGb)} / ${formatStorage(detailHost.diskTotalGb)}`}
                  />
                  <ResourceMeter
                    label="Memory used"
                    value={
                      (detailHost.memoryUsedGb / detailHost.memoryTotalGb) * 100
                    }
                    detail={`${detailHost.memoryUsedGb} / ${detailHost.memoryTotalGb} GB`}
                  />
                </div>
                <div className="flex flex-col gap-3 border border-border bg-muted/30 p-4">
                  <h3 className="text-sm font-semibold">Attached storage</h3>
                  {volumes
                    .filter((volume) => volume.hostId === detailHost.id)
                    .map((volume) => (
                      <div
                        key={volume.id}
                        className="flex items-center justify-between gap-3 text-xs"
                      >
                        <span>
                          {volume.name}{' '}
                          <span className="font-mono text-muted-foreground">
                            {volume.path}
                          </span>
                        </span>
                        <span className="font-mono">
                          {formatStorage(volume.capacityGb - volume.usedGb)}{' '}
                          free
                        </span>
                      </div>
                    ))}
                </div>
                <Alert>
                  <Cpu aria-hidden="true" />
                  <AlertTitle>Enrollment is not connected</AlertTitle>
                  <AlertDescription>
                    These host details are preview data. Configure the
                    management server before enrolling a real machine.
                  </AlertDescription>
                </Alert>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
