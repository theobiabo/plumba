import { ArrowRight, MagnifyingGlass } from '@phosphor-icons/react';
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
  CardFooter,
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
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@plumba/ui/components/field';
import { Input } from '@plumba/ui/components/input';
import { Separator } from '@plumba/ui/components/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@plumba/ui/components/sheet';
import { useRef, useState } from 'react';
import { useWorkspace } from '../../app/use-workspace';
import { PageHeading } from '../../components/page-heading';
import { catalogClients, type CatalogClient } from '../../data/demo-workspace';
import { formatStorage } from '../../lib/format';
import { InstallationWizard } from './installation-wizard';

interface CatalogCardProps {
  client: CatalogClient;
  onDetails: (client: CatalogClient) => void;
  onInstall: (client: CatalogClient) => void;
}

function CatalogCard({ client, onDetails, onInstall }: CatalogCardProps) {
  return (
    <Card className="h-full min-w-0">
      <CardHeader className="flex flex-row items-start gap-3">
        <div
          className="flex size-11 shrink-0 items-center justify-center border border-border bg-muted font-mono text-xs text-muted-foreground"
          aria-hidden="true"
        >
          {client.initials}
        </div>
        <div className="min-w-0 flex-1">
          <CardTitle>
            <h3 className="text-base">{client.client}</h3>
          </CardTitle>
          <CardDescription>{client.chain}</CardDescription>
        </div>
        <Badge
          variant={client.availability === 'preview' ? 'secondary' : 'outline'}
        >
          {client.availability === 'preview' ? 'Preview' : 'Planned'}
        </Badge>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-5">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {client.description}
        </p>
        <div
          className="flex flex-wrap gap-2"
          aria-label={
            client.availability === 'planned'
              ? 'Target networks'
              : 'Preview networks'
          }
        >
          {client.networks.map((network) => (
            <Badge key={network} variant="outline">
              {network}
            </Badge>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Architecture: {client.architectures.join(' / ')}
        </p>
        <dl className="grid grid-cols-3 gap-3 border-t border-border pt-4 text-xs">
          <div className="col-span-3 text-[11px] text-muted-foreground">
            Planning estimate
          </div>
          <div>
            <dt className="text-muted-foreground">CPU</dt>
            <dd className="mt-1 font-mono text-foreground">
              {client.cpuCores} cores
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Memory</dt>
            <dd className="mt-1 font-mono text-foreground">
              {formatStorage(client.memoryGb)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Storage</dt>
            <dd className="mt-1 font-mono text-foreground">
              {formatStorage(client.storageGb)}
            </dd>
          </div>
        </dl>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="outline" onClick={() => onDetails(client)}>
          View details
        </Button>
        {client.availability === 'preview' && (
          <Button onClick={() => onInstall(client)}>
            Preview install
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

interface CatalogSectionProps extends Omit<CatalogCardProps, 'client'> {
  id: string;
  title: string;
  description: string;
  clients: CatalogClient[];
}

function CatalogSection({
  id,
  title,
  description,
  clients,
  onDetails,
  onInstall,
}: CatalogSectionProps) {
  return (
    <section className="flex flex-col gap-4" aria-labelledby={id}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 id={id} className="font-mono text-lg font-medium tracking-tight">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      {clients.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {clients.map((client) => (
            <CatalogCard
              key={client.id}
              client={client}
              onDetails={onDetails}
              onInstall={onInstall}
            />
          ))}
        </div>
      )}
      {clients.length === 0 && (
        <p className="border border-border bg-card p-5 text-sm text-muted-foreground">
          No clients in this section match your search.
        </p>
      )}
    </section>
  );
}

export function CatalogPage() {
  const { hosts, volumes } = useWorkspace();
  const detailsTitleRef = useRef<HTMLHeadingElement>(null);
  const [query, setQuery] = useState('');
  const [detailsClient, setDetailsClient] = useState<CatalogClient | null>(
    null,
  );
  const [wizardClient, setWizardClient] = useState<CatalogClient | null>(null);
  const normalizedQuery = query.trim().toLowerCase();
  const matchingClients = catalogClients.filter((client) =>
    [client.chain, client.client, client.description, ...client.networks]
      .join(' ')
      .toLowerCase()
      .includes(normalizedQuery),
  );
  const previewClients = matchingClients.filter(
    (client) => client.availability === 'preview',
  );
  const plannedClients = matchingClients.filter(
    (client) => client.availability === 'planned',
  );

  function openWizard(client: CatalogClient) {
    if (client.availability !== 'preview') return;
    setDetailsClient(null);
    setWizardClient(client);
  }

  const eligibleHostCount = detailsClient
    ? hosts.filter(
        (host) =>
          host.status === 'online' &&
          detailsClient.architectures.includes(host.architecture) &&
          host.cpuCores >= detailsClient.cpuCores &&
          host.memoryTotalGb - host.memoryUsedGb >= detailsClient.memoryGb &&
          volumes.some(
            (volume) =>
              volume.hostId === host.id &&
              volume.capacityGb - volume.usedGb >= detailsClient.storageGb,
          ),
      ).length
    : 0;

  return (
    <>
      <PageHeading
        title="Node catalog"
        description="Explore blockchain clients and plan a deployment on your own hardware."
      />
      <div className="flex flex-col gap-8">
        <FieldGroup className="max-w-xl">
          <Field>
            <FieldLabel htmlFor="catalog-search">Search clients</FieldLabel>
            <Input
              id="catalog-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search chain, client, or network"
              autoComplete="off"
            />
            <FieldDescription>
              {matchingClients.length}{' '}
              {matchingClients.length === 1 ? 'client' : 'clients'} shown
            </FieldDescription>
          </Field>
        </FieldGroup>

        {matchingClients.length === 0 ? (
          <Empty className="min-h-64 border border-border bg-card">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MagnifyingGlass aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>No matching clients</EmptyTitle>
              <EmptyDescription>
                Try a chain, client, or network name.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <>
            <CatalogSection
              id="preview-clients-title"
              title="Available in preview"
              description="Configure these clients in the sample workspace."
              clients={previewClients}
              onDetails={setDetailsClient}
              onInstall={openWizard}
            />
            <Separator />
            <CatalogSection
              id="planned-clients-title"
              title="Planned clients"
              description="Explore requirements while deployment support is being built."
              clients={plannedClients}
              onDetails={setDetailsClient}
              onInstall={openWizard}
            />
          </>
        )}
      </div>

      {detailsClient && (
        <Sheet
          open
          onOpenChange={(nextOpen) => {
            if (!nextOpen) setDetailsClient(null);
          }}
        >
          <SheetContent
            className="w-full overflow-y-auto sm:max-w-lg"
            initialFocus={detailsTitleRef}
          >
            <SheetHeader className="gap-2 border-b border-border px-6 py-6 pr-10">
              <Badge
                variant={
                  detailsClient.availability === 'preview'
                    ? 'secondary'
                    : 'outline'
                }
              >
                {detailsClient.availability === 'preview'
                  ? 'Preview available'
                  : 'Planned'}
              </Badge>
              <SheetTitle
                ref={detailsTitleRef}
                tabIndex={-1}
                className="font-mono text-xl tracking-tight"
              >
                {detailsClient.client}
              </SheetTitle>
              <SheetDescription>{detailsClient.description}</SheetDescription>
            </SheetHeader>
            <div className="flex flex-1 flex-col gap-6 px-6 py-6">
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-medium">
                  Illustrative hardware requirements
                </h3>
                <dl className="grid grid-cols-2 gap-4 border border-border bg-muted/50 p-4 text-xs">
                  <div>
                    <dt className="text-muted-foreground">Chain</dt>
                    <dd className="mt-1 text-foreground">
                      {detailsClient.chain}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">CPU</dt>
                    <dd className="mt-1 text-foreground">
                      {detailsClient.cpuCores} cores
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Memory</dt>
                    <dd className="mt-1 text-foreground">
                      {formatStorage(detailsClient.memoryGb)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Storage</dt>
                    <dd className="mt-1 text-foreground">
                      {formatStorage(detailsClient.storageGb)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Default RPC port</dt>
                    <dd className="mt-1 text-foreground">
                      {detailsClient.defaultRpcPort}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Compatible hosts</dt>
                    <dd className="mt-1 text-foreground">
                      {detailsClient.availability === 'preview'
                        ? `${eligibleHostCount} in preview`
                        : 'Not available yet'}
                    </dd>
                  </div>
                </dl>
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-medium">
                  {detailsClient.availability === 'planned'
                    ? 'Target networks'
                    : 'Preview networks'}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {detailsClient.networks.map((network) => (
                    <Badge key={network} variant="outline">
                      {network}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <h3 className="text-sm font-medium">
                  Architectures and versions
                </h3>
                <p className="text-xs text-muted-foreground">
                  {detailsClient.architectures.join(', ')} ·{' '}
                  {detailsClient.versions.length > 0
                    ? detailsClient.versions.join(', ')
                    : 'Versions to be announced'}
                </p>
              </div>
              <Alert>
                <AlertTitle>Preview behavior</AlertTitle>
                <AlertDescription>
                  {detailsClient.availability === 'preview'
                    ? 'This wizard creates a sample dashboard entry only. It does not install a node.'
                    : 'This client is planned. Configuration and deployment are not available yet.'}
                </AlertDescription>
              </Alert>
            </div>
            <SheetFooter className="border-t border-border px-6 py-5">
              {detailsClient.availability === 'preview' && (
                <Button onClick={() => openWizard(detailsClient)}>
                  Preview install
                  <ArrowRight data-icon="inline-end" aria-hidden="true" />
                </Button>
              )}
              <Button variant="outline" onClick={() => setDetailsClient(null)}>
                Close details
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      )}

      {wizardClient && (
        <InstallationWizard
          key={wizardClient.id}
          client={wizardClient}
          open
          onOpenChange={(nextOpen) => {
            if (!nextOpen) setWizardClient(null);
          }}
        />
      )}
    </>
  );
}
