import {
  ArrowLeft,
  ArrowUp,
  ArrowsClockwise,
  Copy,
  HardDrives,
  Play,
  Stop,
  Trash,
  Warning,
} from '@phosphor-icons/react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@plumba/ui/components/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@plumba/ui/components/alert-dialog';
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
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from '@plumba/ui/components/empty';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@plumba/ui/components/field';
import { Input } from '@plumba/ui/components/input';
import {
  NativeSelect,
  NativeSelectOption,
} from '@plumba/ui/components/native-select';
import { Progress } from '@plumba/ui/components/progress';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@plumba/ui/components/tabs';
import { toast } from '@plumba/ui/components/toast';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useWorkspace } from '../../app/use-workspace';
import { ResourceSparkline } from '../../components/resource-sparkline';
import { StatusBadge } from '../../components/status-badge';
import { catalogClients, type NodeDeployment } from '../../data/demo-workspace';
import { formatNumber, formatStorage } from '../../lib/format';
import { RpcPanel } from './rpc-panel';

interface RemovalConfirmationProps {
  node: NodeDeployment;
  deleteData: boolean;
  onConfirm: () => void;
}

function RemovalConfirmation({
  node,
  deleteData,
  onConfirm,
}: RemovalConfirmationProps) {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) setConfirmation('');
      }}
    >
      <AlertDialogTrigger
        render={<Button variant={deleteData ? 'destructive' : 'outline'} />}
      >
        <Trash data-icon="inline-start" aria-hidden="true" />
        {deleteData ? 'Delete node and data' : 'Remove deployment'}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {deleteData
              ? 'Delete deployment and its data?'
              : 'Remove deployment and keep its data?'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {deleteData
              ? `${node.name} and its ${formatStorage(node.diskUsedGb)} of node data will be removed from this preview. On a connected system, deleting node data requires syncing again.`
              : `${node.name} will be removed from this preview inventory. Its node data is retained so it can be reused by a future deployment.`}{' '}
            This preview does not send commands or change host files.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {deleteData && (
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="delete-node-confirmation">
                Type {node.name} to confirm
              </FieldLabel>
              <Input
                id="delete-node-confirmation"
                autoComplete="off"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
              />
              <FieldDescription>
                This confirmation applies to the deployment and its data
                together.
              </FieldDescription>
            </Field>
          </FieldGroup>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant={deleteData ? 'destructive' : 'default'}
            disabled={deleteData && confirmation !== node.name}
            onClick={onConfirm}
          >
            {deleteData
              ? 'Delete preview node and data'
              : 'Remove preview deployment'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function NodeLogsPanel({ node }: { node: NodeDeployment }) {
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('all');
  const logs = [
    {
      time: '14:02:11',
      level: 'INFO',
      message: `Loaded ${node.clientId} ${node.version} configuration for ${node.network}.`,
    },
    {
      time: '14:02:12',
      level: 'INFO',
      message: `Opened local chain database for ${node.name}.`,
    },
    {
      time: '14:02:14',
      level: 'INFO',
      message: `Sample peer count: ${node.peers}.`,
    },
    {
      time: '14:02:18',
      level:
        node.status === 'stalled' || node.status === 'disconnected'
          ? 'WARN'
          : 'INFO',
      message:
        node.status === 'stalled'
          ? 'Sample sync checkpoint has not advanced. Check available peers and host resources.'
          : node.status === 'disconnected'
            ? 'Agent unavailable. Displaying the last sample checkpoint.'
            : node.status === 'stopped'
              ? 'Client stopped. Chain data retained on its volume.'
              : `Sample chain checkpoint: block ${formatNumber(node.blockHeight)}, ${node.syncPercent}% synchronized.`,
    },
  ];
  const filtered = logs.filter(
    (entry) =>
      (level === 'all' || entry.level === level) &&
      entry.message.toLowerCase().includes(search.trim().toLowerCase()),
  );

  async function copyLogs() {
    try {
      await navigator.clipboard.writeText(
        filtered
          .map((entry) => `${entry.time} ${entry.level} ${entry.message}`)
          .join('\n'),
      );
      toast.add({ title: 'Sample logs copied', type: 'success' });
    } catch {
      toast.add({
        title: 'Clipboard unavailable',
        description: 'Select the visible log text and copy it manually.',
        type: 'error',
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client logs</CardTitle>
        <CardDescription>
          Illustrative log entries from the sample deployment. No live log
          stream is connected.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <FieldGroup className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_160px]">
          <Field>
            <FieldLabel htmlFor="node-log-search">Search logs</FieldLabel>
            <Input
              id="node-log-search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search log messages…"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="node-log-level">Level</FieldLabel>
            <NativeSelect
              id="node-log-level"
              value={level}
              onChange={(event) => setLevel(event.target.value)}
            >
              <NativeSelectOption value="all">All levels</NativeSelectOption>
              <NativeSelectOption value="INFO">Info</NativeSelectOption>
              <NativeSelectOption value="WARN">Warning</NativeSelectOption>
            </NativeSelect>
          </Field>
        </FieldGroup>
        <div
          className="min-h-60 overflow-x-auto border border-border bg-muted/50 p-4"
          aria-label="Sample client logs"
        >
          {filtered.length > 0 ? (
            <pre className="font-mono text-xs leading-7">
              <code>
                {filtered
                  .map(
                    (entry) =>
                      `${entry.time}  ${entry.level.padEnd(4)}  ${entry.message}`,
                  )
                  .join('\n')}
              </code>
            </pre>
          ) : (
            <p className="text-xs text-muted-foreground">
              No log entries match your filters.
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">
          {filtered.length} sample entries · Timestamps are illustrative
        </span>
        <Button
          variant="outline"
          disabled={filtered.length === 0}
          onClick={() => {
            void copyLogs();
          }}
        >
          <Copy data-icon="inline-start" aria-hidden="true" /> Copy logs
        </Button>
      </CardFooter>
    </Card>
  );
}

export function NodeDetailPage() {
  const { nodeId } = useParams();
  const navigate = useNavigate();
  const { nodes, hosts, volumes, performNodeAction, removeNode } =
    useWorkspace();
  const node = nodes.find((item) => item.id === nodeId);

  if (!node) {
    return (
      <Empty className="min-h-96 border border-border">
        <EmptyHeader>
          <EmptyTitle>Node not found</EmptyTitle>
          <EmptyDescription>
            This deployment may have been removed from the preview workspace.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button render={<Link to="/nodes" />} nativeButton={false}>
            Back to My Nodes
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  const host = hosts.find((item) => item.id === node.hostId);
  const volume = volumes.find((item) => item.id === node.volumeId);
  const client = catalogClients.find((item) => item.id === node.clientId);
  const latestVersion = client?.versions[0];
  const isOnline = host?.status === 'online';
  const isStopped = node.status === 'stopped';
  const updateAvailable = Boolean(
    latestVersion && latestVersion !== node.version,
  );
  const configuration = JSON.stringify(
    {
      name: node.name,
      chain: node.chain,
      client: node.clientId,
      version: node.version,
      network: node.network,
      host: host?.name ?? node.hostId,
      storage: {
        volume: volume?.name ?? node.volumeId,
        path: volume ? `${volume.path}/${node.name}` : 'Unavailable',
      },
      rpc: { enabled: node.rpcEnabled, port: node.rpcPort, access: 'private' },
    },
    null,
    2,
  );

  async function copyConfiguration() {
    try {
      await navigator.clipboard.writeText(configuration);
      toast.add({ title: 'Preview configuration copied', type: 'success' });
    } catch {
      toast.add({
        title: 'Clipboard unavailable',
        description: 'Select the configuration text and copy it manually.',
        type: 'error',
      });
    }
  }

  function confirmRemoval(deleteData: boolean) {
    if (!node) return;
    removeNode(node.id, deleteData);
    navigate('/nodes');
  }

  return (
    <div className="flex flex-col gap-6">
      <Button
        variant="ghost"
        size="sm"
        className="w-fit"
        render={<Link to="/nodes" />}
        nativeButton={false}
      >
        <ArrowLeft data-icon="inline-start" aria-hidden="true" /> My Nodes
      </Button>
      <header className="flex flex-wrap items-start justify-between gap-5 border-b border-border pb-5">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="break-all font-mono text-2xl tracking-tight">
              {node.name}
            </h1>
            <StatusBadge status={node.status} />
          </div>
          <p className="text-xs text-muted-foreground">
            {node.chain} / {node.network} · {client?.client ?? node.clientId}{' '}
            <span className="font-mono">{node.version}</span> ·{' '}
            <span className="font-mono">
              {host?.name ?? 'Host unavailable'}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isStopped ? (
            <Button
              disabled={!isOnline}
              onClick={() => performNodeAction(node.id, 'start')}
            >
              <Play data-icon="inline-start" aria-hidden="true" /> Start
            </Button>
          ) : (
            <Button
              variant="outline"
              disabled={!isOnline}
              onClick={() => performNodeAction(node.id, 'stop')}
            >
              <Stop data-icon="inline-start" aria-hidden="true" /> Stop
            </Button>
          )}
          <Button
            variant="outline"
            disabled={!isOnline || isStopped}
            onClick={() => performNodeAction(node.id, 'restart')}
          >
            <ArrowsClockwise data-icon="inline-start" aria-hidden="true" />{' '}
            Restart
          </Button>
          <Button
            variant="outline"
            disabled={!isOnline || !updateAvailable}
            title={
              updateAvailable
                ? `Sample version ${latestVersion} is available`
                : 'Already on the latest catalog version in this preview'
            }
            onClick={() => performNodeAction(node.id, 'update')}
          >
            <ArrowUp data-icon="inline-start" aria-hidden="true" />{' '}
            {updateAvailable ? `Update to ${latestVersion}` : 'Up to date'}
          </Button>
        </div>
      </header>
      {!isOnline && (
        <Alert variant="destructive">
          <Warning aria-hidden="true" />
          <AlertTitle>Host disconnected</AlertTitle>
          <AlertDescription>
            Last contact: {host?.lastContact ?? 'unavailable'}. Node controls
            are disabled until its host is available. Resource history shows the
            last sample values.
          </AlertDescription>
        </Alert>
      )}
      {node.status === 'stalled' && (
        <Alert>
          <Warning aria-hidden="true" />
          <AlertTitle>Sync needs attention</AlertTitle>
          <AlertDescription>
            The sample node has not advanced for {node.lastUpdate}. Check peers,
            disk capacity, and client logs before restarting.
          </AlertDescription>
        </Alert>
      )}
      <Tabs key={node.id} defaultValue="overview" className="gap-6">
        <TabsList
          aria-label="Node detail sections"
          className="max-w-full overflow-x-auto"
        >
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="rpc">RPC</TabsTrigger>
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              {
                label: 'Block height',
                value: formatNumber(node.blockHeight),
                detail: 'Latest sample checkpoint',
              },
              {
                label: 'Connected peers',
                value: formatNumber(node.peers),
                detail: 'Sample peer connections',
              },
              {
                label: 'Node storage',
                value: formatStorage(node.diskUsedGb),
                detail: volume?.name ?? 'Volume unavailable',
              },
              {
                label: 'Last update',
                value: node.lastUpdate,
                detail: 'Sample telemetry',
              },
            ].map((metric) => (
              <Card key={metric.label} size="sm" className="min-w-0 gap-0">
                <CardHeader>
                  <CardTitle>{metric.label}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <strong className="break-words font-mono text-lg font-medium tracking-tight">
                    {metric.value}
                  </strong>
                  <p className="text-xs text-muted-foreground">
                    {metric.detail}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>Chain synchronization</CardTitle>
                <Badge variant="outline">{node.syncPercent}%</Badge>
              </div>
              <CardDescription>
                {node.syncPercent >= 100
                  ? 'The sample chain checkpoint is synchronized.'
                  : 'Initial sync progress from the sample workspace.'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Progress
                value={node.syncPercent}
                aria-label="Chain synchronization progress"
              />
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                Block {formatNumber(node.blockHeight)} · {node.network} ·{' '}
                {node.peers} peers
              </p>
            </CardFooter>
          </Card>
          <section
            aria-labelledby="node-resource-title"
            className="flex flex-col gap-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="node-resource-title" className="text-sm">
                Resource history
              </h2>
              <span className="text-xs text-muted-foreground">
                12 sample checkpoints
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { label: 'CPU', values: node.cpuHistory },
                { label: 'Memory', values: node.memoryHistory },
                { label: 'Disk utilization', values: node.diskHistory },
              ].map((resource) => (
                <Card key={resource.label}>
                  <CardHeader>
                    <div className="flex items-center justify-between gap-3">
                      <CardTitle>{resource.label}</CardTitle>
                      <span className="text-sm">
                        {resource.values.at(-1) ?? 0}%
                      </span>
                    </div>
                    <CardDescription>
                      Sample usage over recent checkpoints.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResourceSparkline
                      values={resource.values}
                      label={resource.label}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
          <Card>
            <CardHeader>
              <CardTitle>Host and storage</CardTitle>
              <CardDescription>
                Where the sample deployment and chain data are located.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs text-muted-foreground">Host</dt>
                  <dd className="mt-2 flex items-center gap-3">
                    {host?.name ?? 'Unavailable'}
                    {host && <StatusBadge status={host.status} />}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Data path</dt>
                  <dd className="mt-2 break-all font-mono text-xs">
                    {volume ? `${volume.path}/${node.name}` : 'Unavailable'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Volume</dt>
                  <dd className="mt-2">{volume?.name ?? 'Unavailable'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">
                    Volume capacity
                  </dt>
                  <dd className="mt-2">
                    {volume
                      ? `${formatStorage(volume.usedGb)} used / ${formatStorage(volume.capacityGb)}`
                      : 'Unavailable'}
                  </dd>
                </div>
              </dl>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                size="sm"
                render={<Link to="/storage" />}
                nativeButton={false}
              >
                <HardDrives data-icon="inline-start" aria-hidden="true" /> View
                storage
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="logs">
          <NodeLogsPanel node={node} />
        </TabsContent>
        <TabsContent value="rpc">
          <RpcPanel node={node} host={host} />
        </TabsContent>
        <TabsContent value="configuration" className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <CardTitle>Deployment configuration</CardTitle>
                <Badge variant="secondary">Read only</Badge>
              </div>
              <CardDescription>
                The preview specification shown here is not a running container
                configuration.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="overflow-x-auto border border-border bg-muted/50 p-4 font-mono text-xs leading-6">
                <code>{configuration}</code>
              </pre>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                onClick={() => {
                  void copyConfiguration();
                }}
              >
                <Copy data-icon="inline-start" aria-hidden="true" /> Copy
                configuration
              </Button>
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Remove deployment</CardTitle>
              <CardDescription>
                Remove the deployment from the workspace and keep its chain
                data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Retained data can be reused when deploying the client again.
              </p>
            </CardContent>
            <CardFooter>
              <RemovalConfirmation
                node={node}
                deleteData={false}
                onConfirm={() => confirmRemoval(false)}
              />
            </CardFooter>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Delete deployment and data</CardTitle>
              <CardDescription>
                Remove the deployment and its chain data together.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Deleting {formatStorage(node.diskUsedGb)} of node data would
                require a fresh synchronization on a connected system. Other
                nodes and the shared volume are excluded.
              </p>
            </CardContent>
            <CardFooter>
              <RemovalConfirmation
                node={node}
                deleteData
                onConfirm={() => confirmRemoval(true)}
              />
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
      <p className="text-xs text-muted-foreground">
        Interface preview · Controls change sample browser state only. No
        commands are sent to your hardware.
      </p>
    </div>
  );
}
