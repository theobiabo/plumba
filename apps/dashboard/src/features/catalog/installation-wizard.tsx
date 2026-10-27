import {
  ArrowLeft,
  ArrowRight,
  Check,
  WarningCircle,
} from '@phosphor-icons/react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@plumba/ui/components/alert';
import { Badge } from '@plumba/ui/components/badge';
import { Button } from '@plumba/ui/components/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@plumba/ui/components/dialog';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@plumba/ui/components/field';
import { Input } from '@plumba/ui/components/input';
import {
  NativeSelect,
  NativeSelectOption,
} from '@plumba/ui/components/native-select';
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from '@plumba/ui/components/progress';
import { Separator } from '@plumba/ui/components/separator';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWorkspace } from '../../app/use-workspace';
import type {
  CatalogClient,
  Host,
  NodeDeployment,
  StorageVolume,
} from '../../data/demo-workspace';
import { formatStorage } from '../../lib/format';

interface InstallationWizardProps {
  client: CatalogClient;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface InstallDraft {
  hostId: string;
  network: string;
  version: string;
  volumeId: string;
  name: string;
  rpcPort: string;
}

type WizardStep = 'host' | 'configuration' | 'storage' | 'review' | 'progress';
type SubmissionState = 'idle' | 'working' | 'success' | 'error';

const setupSteps: { id: Exclude<WizardStep, 'progress'>; label: string }[] = [
  { id: 'host', label: 'Host' },
  { id: 'configuration', label: 'Client' },
  { id: 'storage', label: 'Storage' },
  { id: 'review', label: 'Review' },
];

function freeSpace(volume: StorageVolume) {
  return volume.capacityGb - volume.usedGb;
}

function freeMemory(host: Host) {
  return host.memoryTotalGb - host.memoryUsedGb;
}

function availablePort(
  hostId: string,
  preferred: number,
  nodes: NodeDeployment[],
) {
  const usedPorts = new Set(
    nodes.filter((node) => node.hostId === hostId).map((node) => node.rpcPort),
  );

  for (let port = preferred; port <= 65535; port += 1) {
    if (!usedPorts.has(port)) return port;
  }

  return preferred;
}

function createDraft(
  client: CatalogClient,
  hosts: Host[],
  volumes: StorageVolume[],
  nodes: NodeDeployment[],
  selectedHostId: string,
): InstallDraft {
  const preferredHost = hosts.find((host) => host.id === selectedHostId);
  const eligibleHost = hosts.find(
    (host) =>
      host.status === 'online' &&
      client.architectures.includes(host.architecture) &&
      host.cpuCores >= client.cpuCores &&
      freeMemory(host) >= client.memoryGb &&
      volumes.some(
        (volume) =>
          volume.hostId === host.id && freeSpace(volume) >= client.storageGb,
      ),
  );
  const host =
    preferredHost ??
    eligibleHost ??
    hosts.find((item) => item.status === 'online');
  const volume = volumes.find(
    (item) => item.hostId === host?.id && freeSpace(item) >= client.storageGb,
  );
  const network = client.networks[0] ?? '';

  return {
    hostId: host?.id ?? '',
    network,
    version: client.versions[0] ?? '',
    volumeId: volume?.id ?? '',
    name: `${client.id}-${network.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-preview`,
    rpcPort: String(
      availablePort(host?.id ?? '', client.defaultRpcPort, nodes),
    ),
  };
}

export function InstallationWizard({
  client,
  open,
  onOpenChange,
}: InstallationWizardProps) {
  const { hosts, nodes, volumes, selectedHostId, installNode } = useWorkspace();
  const [draft, setDraft] = useState<InstallDraft>(() =>
    createDraft(client, hosts, volumes, nodes, selectedHostId),
  );
  const [step, setStep] = useState<WizardStep>('host');
  const [submission, setSubmission] = useState<SubmissionState>('idle');
  const [progress, setProgress] = useState(0);
  const [createdNode, setCreatedNode] = useState<NodeDeployment | null>(null);
  const [submissionError, setSubmissionError] = useState('');
  const timers = useRef<number[]>([]);

  useEffect(
    () => () => {
      timers.current.forEach((timer) => window.clearTimeout(timer));
    },
    [],
  );

  const host = hosts.find((item) => item.id === draft.hostId);
  const volume = volumes.find((item) => item.id === draft.volumeId);
  const hostVolumes = volumes.filter((item) => item.hostId === draft.hostId);
  const parsedPort = Number(draft.rpcPort);

  const hostError = !host
    ? 'Choose a host.'
    : host.status !== 'online'
      ? 'This host is offline.'
      : !client.architectures.includes(host.architecture)
        ? 'This client does not support the host architecture.'
        : host.cpuCores < client.cpuCores
          ? 'This host does not meet the CPU requirement.'
          : freeMemory(host) < client.memoryGb
            ? 'This host does not have enough available memory.'
            : '';
  const networkError = client.networks.includes(draft.network)
    ? ''
    : 'Choose a supported network.';
  const versionError = client.versions.includes(draft.version)
    ? ''
    : 'Choose an available preview version.';
  const nameError =
    draft.name.trim().length < 3
      ? 'Enter a node name with at least three characters.'
      : nodes.some(
            (node) =>
              node.name.toLowerCase() === draft.name.trim().toLowerCase(),
          )
        ? 'A node with this name already exists.'
        : '';
  const portError =
    !Number.isInteger(parsedPort) || parsedPort < 1 || parsedPort > 65535
      ? 'Enter a port between 1 and 65535.'
      : nodes.some(
            (node) =>
              node.hostId === draft.hostId && node.rpcPort === parsedPort,
          )
        ? 'This port is already assigned on the selected host.'
        : '';
  const volumeError =
    !volume || volume.hostId !== draft.hostId
      ? 'Choose a volume on the selected host.'
      : freeSpace(volume) < client.storageGb
        ? 'This volume does not have enough free space.'
        : '';
  const configurationValid =
    !networkError && !versionError && !nameError && !portError;
  const ready = !hostError && configurationValid && !volumeError;
  const stepIndex = setupSteps.findIndex((item) => item.id === step);

  function closeWizard() {
    timers.current.forEach((timer) => window.clearTimeout(timer));
    timers.current = [];
    onOpenChange(false);
  }

  function chooseHost(hostId: string) {
    const nextVolume = volumes.find(
      (item) => item.hostId === hostId && freeSpace(item) >= client.storageGb,
    );
    setDraft((current) => ({
      ...current,
      hostId,
      volumeId: nextVolume?.id ?? '',
      rpcPort: String(availablePort(hostId, client.defaultRpcPort, nodes)),
    }));
  }

  function goBack() {
    if (step === 'host') {
      closeWizard();
    } else if (step === 'configuration') {
      setStep('host');
    } else if (step === 'storage') {
      setStep('configuration');
    } else {
      setStep('storage');
    }
  }

  function confirmPreview() {
    if (!ready || submission === 'working') return;

    timers.current.forEach((timer) => window.clearTimeout(timer));
    setStep('progress');
    setSubmission('working');
    setSubmissionError('');
    setProgress(20);

    timers.current = [
      window.setTimeout(() => setProgress(65), 250),
      window.setTimeout(() => {
        try {
          const deployment = installNode({
            clientId: client.id,
            hostId: draft.hostId,
            network: draft.network,
            version: draft.version,
            volumeId: draft.volumeId,
            name: draft.name.trim(),
            rpcPort: parsedPort,
          });
          setCreatedNode(deployment);
          setProgress(100);
          setSubmission('success');
        } catch (error) {
          setSubmissionError(
            error instanceof Error
              ? error.message
              : 'The preview entry could not be created.',
          );
          setSubmission('error');
        }
      }, 550),
    ];
  }

  function goForward() {
    if (step === 'host' && !hostError) setStep('configuration');
    if (step === 'configuration' && configurationValid) setStep('storage');
    if (step === 'storage' && !volumeError) setStep('review');
    if (step === 'review') confirmPreview();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) onOpenChange(true);
        else closeWizard();
      }}
    >
      <DialogContent className="max-h-[min(90dvh,760px)] overflow-y-auto sm:max-w-2xl">
        <DialogHeader className="pr-8">
          <DialogTitle>Preview installation · {client.client}</DialogTitle>
          <DialogDescription>
            Configure a sample deployment. Confirming adds a record to this
            browser preview only.
          </DialogDescription>
        </DialogHeader>

        {step !== 'progress' && (
          <div className="flex flex-col gap-2">
            <ol
              className="grid grid-cols-4 gap-2"
              aria-label="Installation setup steps"
            >
              {setupSteps.map((item, index) => (
                <li
                  key={item.id}
                  aria-current={step === item.id ? 'step' : undefined}
                  className="flex min-w-0 items-center gap-2 text-xs text-muted-foreground"
                >
                  <Badge variant={index === stepIndex ? 'default' : 'outline'}>
                    {String(index + 1).padStart(2, '0')}
                  </Badge>
                  <span className="sr-only sm:not-sr-only sm:truncate">
                    {item.label}
                  </span>
                </li>
              ))}
            </ol>
            <Progress
              value={((stepIndex + 1) / setupSteps.length) * 100}
              aria-label="Setup progress"
            />
          </div>
        )}

        {step === 'host' && (
          <FieldGroup>
            <Field data-invalid={Boolean(hostError)}>
              <FieldLabel htmlFor="install-host">Host</FieldLabel>
              <NativeSelect
                className="w-full"
                id="install-host"
                value={draft.hostId}
                onChange={(event) => chooseHost(event.target.value)}
                aria-invalid={Boolean(hostError)}
              >
                <NativeSelectOption value="">Choose a host</NativeSelectOption>
                {hosts.map((item) => (
                  <NativeSelectOption key={item.id} value={item.id}>
                    {item.name} · {item.status} · {item.architecture}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldDescription>
                The host must be online and meet the client CPU, memory, and
                architecture requirements.
              </FieldDescription>
              {hostError && <FieldError>{hostError}</FieldError>}
            </Field>
            {host && (
              <dl className="grid gap-3 border border-border bg-card p-4 text-xs sm:grid-cols-4">
                <div>
                  <dt className="text-muted-foreground">Architecture</dt>
                  <dd className="mt-1 text-foreground">{host.architecture}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">CPU cores</dt>
                  <dd className="mt-1 text-foreground">{host.cpuCores}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Available memory</dt>
                  <dd className="mt-1 text-foreground">
                    {formatStorage(freeMemory(host))}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Volumes</dt>
                  <dd className="mt-1 text-foreground">{hostVolumes.length}</dd>
                </div>
              </dl>
            )}
          </FieldGroup>
        )}

        {step === 'configuration' && (
          <FieldGroup>
            <FieldGroup className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={Boolean(networkError)}>
                <FieldLabel htmlFor="install-network">Network</FieldLabel>
                <NativeSelect
                  className="w-full"
                  id="install-network"
                  value={draft.network}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      network: event.target.value,
                    }))
                  }
                  aria-invalid={Boolean(networkError)}
                >
                  {client.networks.map((network) => (
                    <NativeSelectOption key={network} value={network}>
                      {network}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                {networkError && <FieldError>{networkError}</FieldError>}
              </Field>
              <Field data-invalid={Boolean(versionError)}>
                <FieldLabel htmlFor="install-version">
                  Client version
                </FieldLabel>
                <NativeSelect
                  className="w-full"
                  id="install-version"
                  value={draft.version}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      version: event.target.value,
                    }))
                  }
                  aria-invalid={Boolean(versionError)}
                >
                  {client.versions.map((version) => (
                    <NativeSelectOption key={version} value={version}>
                      {version}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
                {versionError && <FieldError>{versionError}</FieldError>}
              </Field>
            </FieldGroup>
            <FieldGroup className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={Boolean(nameError)}>
                <FieldLabel htmlFor="install-name">Node name</FieldLabel>
                <Input
                  id="install-name"
                  value={draft.name}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  aria-invalid={Boolean(nameError)}
                  autoComplete="off"
                />
                <FieldDescription>
                  Use a unique name with at least three characters.
                </FieldDescription>
                {nameError && <FieldError>{nameError}</FieldError>}
              </Field>
              <Field data-invalid={Boolean(portError)}>
                <FieldLabel htmlFor="install-rpc-port">RPC port</FieldLabel>
                <Input
                  id="install-rpc-port"
                  type="number"
                  min={1}
                  max={65535}
                  step={1}
                  value={draft.rpcPort}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      rpcPort: event.target.value,
                    }))
                  }
                  aria-invalid={Boolean(portError)}
                />
                <FieldDescription>
                  The port must be unused on this host.
                </FieldDescription>
                {portError && <FieldError>{portError}</FieldError>}
              </Field>
            </FieldGroup>
          </FieldGroup>
        )}

        {step === 'storage' && (
          <FieldGroup>
            <Field data-invalid={Boolean(volumeError)}>
              <FieldLabel htmlFor="install-volume">Storage volume</FieldLabel>
              <NativeSelect
                className="w-full"
                id="install-volume"
                value={draft.volumeId}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    volumeId: event.target.value,
                  }))
                }
                aria-invalid={Boolean(volumeError)}
              >
                <NativeSelectOption value="">
                  Choose a volume
                </NativeSelectOption>
                {hostVolumes.map((item) => (
                  <NativeSelectOption key={item.id} value={item.id}>
                    {item.name} · {formatStorage(freeSpace(item))} free
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldDescription>
                {client.client} needs at least {formatStorage(client.storageGb)}{' '}
                free for its data.
              </FieldDescription>
              {volumeError && <FieldError>{volumeError}</FieldError>}
            </Field>
            {volume && volume.hostId === draft.hostId && (
              <dl className="grid gap-3 border border-border bg-card p-4 text-xs sm:grid-cols-3">
                <div>
                  <dt className="text-muted-foreground">Mount path</dt>
                  <dd className="mt-1 break-all text-foreground">
                    {volume.path}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Type</dt>
                  <dd className="mt-1 text-foreground">{volume.type}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Available</dt>
                  <dd className="mt-1 text-foreground">
                    {formatStorage(freeSpace(volume))}
                  </dd>
                </div>
              </dl>
            )}
          </FieldGroup>
        )}

        {step === 'review' && (
          <div className="flex flex-col gap-4">
            <dl className="grid gap-4 border border-border bg-card p-4 text-xs sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Client</dt>
                <dd className="mt-1 text-foreground">
                  {client.chain} · {client.client}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Host</dt>
                <dd className="mt-1 text-foreground">
                  {host?.name ?? 'None selected'}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Network and version</dt>
                <dd className="mt-1 text-foreground">
                  {draft.network} · {draft.version}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Storage</dt>
                <dd className="mt-1 text-foreground">
                  {volume?.name ?? 'None selected'}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Node name</dt>
                <dd className="mt-1 break-all text-foreground">
                  {draft.name.trim()}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">RPC port</dt>
                <dd className="mt-1 text-foreground">{draft.rpcPort}</dd>
              </div>
            </dl>
            <Separator />
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-medium">Readiness checks</h3>
              <ul className="grid gap-2 text-xs sm:grid-cols-2">
                {[
                  { label: 'Host online and compatible', valid: !hostError },
                  {
                    label: 'Client configuration valid',
                    valid: configurationValid,
                  },
                  { label: 'Storage space available', valid: !volumeError },
                  {
                    label: 'Name and RPC port available',
                    valid: !nameError && !portError,
                  },
                ].map((check) => (
                  <li key={check.label} className="flex items-center gap-2">
                    <Badge variant={check.valid ? 'secondary' : 'destructive'}>
                      {check.valid ? (
                        <Check aria-hidden="true" />
                      ) : (
                        <WarningCircle aria-hidden="true" />
                      )}
                      {check.valid ? 'Pass' : 'Fix'}
                    </Badge>
                    <span>{check.label}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Alert>
              <AlertTitle>Browser preview only</AlertTitle>
              <AlertDescription>
                Confirming adds a sample node entry to this dashboard. It does
                not install software, reserve storage, or contact your host.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {step === 'progress' && (
          <div className="flex flex-col gap-5 py-4" aria-live="polite">
            <div className="flex flex-col gap-2">
              <Progress value={progress}>
                <ProgressLabel>
                  {submission === 'success'
                    ? 'Preview entry created'
                    : submission === 'error'
                      ? 'Preview entry was not created'
                      : 'Adding entry to browser preview'}
                </ProgressLabel>
                <ProgressValue />
              </Progress>
              <p className="text-xs text-muted-foreground">
                No command is sent to your host.
              </p>
            </div>
            {submission === 'success' && createdNode && (
              <Alert>
                <AlertTitle>{createdNode.name} is in the preview</AlertTitle>
                <AlertDescription>
                  Open its detail page to inspect the sample deployment. No node
                  was installed on hardware.
                </AlertDescription>
              </Alert>
            )}
            {submission === 'error' && (
              <Alert variant="destructive">
                <WarningCircle aria-hidden="true" />
                <AlertTitle>Could not add the preview entry</AlertTitle>
                <AlertDescription>{submissionError}</AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {step !== 'progress' ? (
          <DialogFooter>
            <Button variant="outline" onClick={goBack}>
              {step === 'host' ? (
                'Cancel'
              ) : (
                <ArrowLeft data-icon="inline-start" aria-hidden="true" />
              )}
              {step === 'host' ? null : 'Back'}
            </Button>
            <Button
              onClick={goForward}
              disabled={
                (step === 'host' && Boolean(hostError)) ||
                (step === 'configuration' && !configurationValid) ||
                (step === 'storage' && Boolean(volumeError)) ||
                (step === 'review' && !ready)
              }
            >
              {step === 'review' ? 'Confirm preview deployment' : 'Continue'}
              {step !== 'review' && (
                <ArrowRight data-icon="inline-end" aria-hidden="true" />
              )}
            </Button>
          </DialogFooter>
        ) : (
          <DialogFooter>
            {submission === 'error' && (
              <Button
                variant="outline"
                onClick={() => {
                  setSubmission('idle');
                  setStep('review');
                }}
              >
                Back to review
              </Button>
            )}
            {submission === 'error' && (
              <Button onClick={confirmPreview}>Try again</Button>
            )}
            {submission === 'success' && createdNode && (
              <Button
                render={<Link to={`/nodes/${createdNode.id}`} />}
                nativeButton={false}
              >
                View preview node
                <ArrowRight data-icon="inline-end" aria-hidden="true" />
              </Button>
            )}
            <Button variant="outline" onClick={closeWizard}>
              {submission === 'working' ? 'Cancel' : 'Close'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
