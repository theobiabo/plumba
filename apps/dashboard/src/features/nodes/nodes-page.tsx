import { ArrowRight, Stack } from '@phosphor-icons/react';
import { Badge } from '@plumba/ui/components/badge';
import { Button } from '@plumba/ui/components/button';
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
import { Progress } from '@plumba/ui/components/progress';
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
import { useWorkspace } from '../../app/use-workspace';
import { StatusBadge } from '../../components/status-badge';
import { catalogClients } from '../../data/demo-workspace';
import { formatNumber, formatStorage } from '../../lib/format';

const statuses = [
  'ready',
  'running',
  'syncing',
  'stalled',
  'stopped',
  'disconnected',
];

export function NodesPage() {
  const { nodes, hosts, selectedHostId, setSelectedHostId } = useWorkspace();
  const [search, setSearch] = useState('');
  const [chain, setChain] = useState('all');
  const [status, setStatus] = useState('all');
  const chains = [...new Set(nodes.map((node) => node.chain))];
  const query = search.trim().toLowerCase();
  const filteredNodes = nodes.filter((node) => {
    const host = hosts.find((item) => item.id === node.hostId);
    const searchable =
      `${node.name} ${node.chain} ${node.network} ${host?.name ?? ''}`.toLowerCase();
    return (
      searchable.includes(query) &&
      (chain === 'all' || node.chain === chain) &&
      (status === 'all' || node.status === status) &&
      (selectedHostId === 'all' || node.hostId === selectedHostId)
    );
  });

  function clearFilters() {
    setSearch('');
    setChain('all');
    setStatus('all');
    setSelectedHostId('all');
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="flex items-center gap-3 text-2xl font-semibold tracking-tight">
            My Nodes
            <Badge variant="secondary">{nodes.length}</Badge>
          </h1>
          <p className="text-xs text-muted-foreground">
            Your blockchain clients, their health, and where they run.
          </p>
        </div>
      </header>
      <FieldGroup className="grid grid-cols-1 gap-3 border border-border bg-card p-4 sm:grid-cols-2 xl:grid-cols-[minmax(180px,1fr)_160px_160px_160px]">
        <Field>
          <FieldLabel htmlFor="node-search">Search nodes</FieldLabel>
          <Input
            id="node-search"
            placeholder="Name, chain, network, host…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="node-chain-filter">Chain</FieldLabel>
          <NativeSelect
            id="node-chain-filter"
            value={chain}
            onChange={(event) => setChain(event.target.value)}
          >
            <NativeSelectOption value="all">All chains</NativeSelectOption>
            {chains.map((item) => (
              <NativeSelectOption key={item} value={item}>
                {item}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="node-status-filter">Status</FieldLabel>
          <NativeSelect
            id="node-status-filter"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <NativeSelectOption value="all">All statuses</NativeSelectOption>
            {statuses.map((item) => (
              <NativeSelectOption key={item} value={item}>
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
        <Field>
          <FieldLabel htmlFor="node-host-filter">Host</FieldLabel>
          <NativeSelect
            id="node-host-filter"
            value={selectedHostId}
            onChange={(event) => setSelectedHostId(event.target.value)}
          >
            <NativeSelectOption value="all">All hosts</NativeSelectOption>
            {hosts.map((host) => (
              <NativeSelectOption key={host.id} value={host.id}>
                {host.name}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
      </FieldGroup>
      {filteredNodes.length > 0 ? (
        <div className="overflow-x-auto border border-border bg-card">
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Node</TableHead>
                <TableHead>Network / client</TableHead>
                <TableHead>Host</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sync progress</TableHead>
                <TableHead>Storage</TableHead>
                <TableHead>Last update</TableHead>
                <TableHead>
                  <span className="sr-only">View node</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNodes.map((node) => {
                const host = hosts.find((item) => item.id === node.hostId);
                const client = catalogClients.find(
                  (item) => item.id === node.clientId,
                );
                return (
                  <TableRow key={node.id}>
                    <TableCell className="pl-4 py-4">
                      <Link
                        className="font-semibold transition-colors hover:text-primary hover:underline"
                        to={`/nodes/${node.id}`}
                      >
                        {node.name}
                      </Link>
                      <p className="mt-1 text-muted-foreground">{node.chain}</p>
                    </TableCell>
                    <TableCell>
                      <div>{node.network}</div>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">
                        {client?.client ?? node.clientId} {node.version}
                      </p>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {host?.name ?? 'Host unavailable'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={node.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex min-w-28 flex-col gap-2">
                        <div className="flex justify-between gap-3 font-mono text-xs">
                          <span>{node.syncPercent}%</span>
                          <span className="text-muted-foreground">
                            #{formatNumber(node.blockHeight)}
                          </span>
                        </div>
                        <Progress
                          value={node.syncPercent}
                          aria-label={`${node.name} sync progress`}
                        />
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {formatStorage(node.diskUsedGb)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {node.lastUpdate}
                    </TableCell>
                    <TableCell className="pr-4">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`View ${node.name}`}
                        render={<Link to={`/nodes/${node.id}`} />}
                        nativeButton={false}
                      >
                        <ArrowRight aria-hidden="true" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <Empty className="min-h-72 border border-border bg-card">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Stack aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>
              {nodes.length === 0
                ? 'Your first node starts here.'
                : 'No nodes match these filters.'}
            </EmptyTitle>
            <EmptyDescription>
              {nodes.length === 0
                ? 'Choose a client from the catalog to add a deployment to this preview.'
                : 'Try a different name, status, chain, or host.'}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            {nodes.length === 0 ? (
              <Button render={<Link to="/catalog" />} nativeButton={false}>
                Browse catalog
              </Button>
            ) : (
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </EmptyContent>
        </Empty>
      )}
      <p className="text-xs text-muted-foreground" aria-live="polite">
        Showing {filteredNodes.length} of {nodes.length} nodes · Sample
        inventory, no live hardware connected.
      </p>
    </div>
  );
}
