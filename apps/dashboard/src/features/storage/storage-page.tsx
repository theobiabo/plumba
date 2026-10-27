import {
  ArrowRight,
  Database,
  HardDrives,
  Warning,
} from '@phosphor-icons/react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@plumba/ui/components/alert';
import { Badge } from '@plumba/ui/components/badge';
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
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
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
import { Link } from 'react-router-dom';
import { PageHeading } from '../../components/page-heading';
import { ResourceMeter } from '../../components/resource-meter';
import { useWorkspace } from '../../app/use-workspace';
import { formatStorage } from '../../lib/format';

export function StoragePage() {
  const { hosts, nodes, volumes, selectedHostId } = useWorkspace();
  const visibleVolumes = volumes.filter(
    (volume) => selectedHostId === 'all' || volume.hostId === selectedHostId,
  );
  const lowSpaceVolumes = visibleVolumes.filter(
    (volume) => (volume.capacityGb - volume.usedGb) / volume.capacityGb < 0.15,
  );
  const totalCapacity = visibleVolumes.reduce(
    (sum, volume) => sum + volume.capacityGb,
    0,
  );
  const totalFree = visibleVolumes.reduce(
    (sum, volume) => sum + volume.capacityGb - volume.usedGb,
    0,
  );

  return (
    <>
      <PageHeading
        title="Storage"
        description="Volume capacity, free space and per-node usage across your machines."
      />

      {lowSpaceVolumes.length > 0 && (
        <Alert>
          <Warning aria-hidden="true" />
          <AlertTitle>
            Low space on{' '}
            {lowSpaceVolumes.map((volume) => volume.name).join(', ')}
          </AlertTitle>
          <AlertDescription>
            Free space is below 15%. Plan a larger volume or review node data
            before deploying more clients.{' '}
            <Link to="/hosts">Inspect host capacity</Link>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Card size="sm">
          <CardHeader>
            <CardDescription>Total capacity</CardDescription>
            <CardTitle className="font-mono text-xl">
              {formatStorage(totalCapacity)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>Free across volumes</CardDescription>
            <CardTitle className="font-mono text-xl">
              {formatStorage(totalFree)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm" className="col-span-2 sm:col-span-1">
          <CardHeader>
            <CardDescription>Volumes needing attention</CardDescription>
            <CardTitle className="font-mono text-xl">
              {lowSpaceVolumes.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {visibleVolumes.length === 0 ? (
        <Empty className="min-h-64 border border-dashed border-border bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Database aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>No volumes in this host context</EmptyTitle>
            <EmptyDescription>
              Select another host from the header to see its storage.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {visibleVolumes.map((volume) => {
            const host = hosts.find((item) => item.id === volume.hostId);
            const free = volume.capacityGb - volume.usedGb;
            const volumeNodes = nodes.filter(
              (node) => node.volumeId === volume.id,
            );
            const accountedUsage = volumeNodes.reduce(
              (sum, node) => sum + node.diskUsedGb,
              0,
            );
            const otherUsage = Math.max(0, volume.usedGb - accountedUsage);

            return (
              <Card key={volume.id} className="min-w-0">
                <CardHeader className="sm:grid-cols-[minmax(0,1fr)_auto]">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center border border-border bg-muted text-muted-foreground">
                      <HardDrives size={18} aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <CardTitle>{volume.name}</CardTitle>
                      <CardDescription className="font-mono">
                        {host?.name ?? volume.hostId} · {volume.path}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="outline" className="font-mono">
                    {volume.type}
                  </Badge>
                </CardHeader>
                <CardContent className="flex flex-col gap-5">
                  <ResourceMeter
                    label="Used"
                    value={(volume.usedGb / volume.capacityGb) * 100}
                    detail={`${formatStorage(volume.usedGb)} / ${formatStorage(volume.capacityGb)}`}
                  />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Available for new deployments
                    </span>
                    <strong className="font-mono font-medium">
                      {formatStorage(free)}
                    </strong>
                  </div>
                  {free / volume.capacityGb < 0.15 && (
                    <Alert variant="destructive">
                      <Warning aria-hidden="true" />
                      <AlertTitle>Capacity warning</AlertTitle>
                      <AlertDescription>
                        New node data may not fit on this volume.
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="overflow-x-auto border-t border-border pt-3">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <h2 className="text-xs font-semibold">
                        Space by deployment
                      </h2>
                      <Button
                        variant="link"
                        size="sm"
                        render={<Link to="/nodes" />}
                        nativeButton={false}
                        className="h-auto p-0"
                      >
                        My Nodes{' '}
                        <ArrowRight data-icon="inline-end" aria-hidden="true" />
                      </Button>
                    </div>
                    <Table className="min-w-[330px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead className="text-right">Used</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {volumeNodes.map((node) => (
                          <TableRow key={node.id}>
                            <TableCell>
                              <Link
                                className="font-mono text-xs hover:text-primary hover:underline"
                                to={`/nodes/${node.id}`}
                              >
                                {node.name}
                              </Link>
                            </TableCell>
                            <TableCell className="text-right font-mono text-xs">
                              {formatStorage(node.diskUsedGb)}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell className="text-xs text-muted-foreground">
                            Other host data
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            {formatStorage(otherUsage)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
      <p className="text-xs leading-5 text-muted-foreground">
        These capacity figures are sample data. Real free-space and per-node
        usage require a connected host agent.
      </p>
    </>
  );
}
