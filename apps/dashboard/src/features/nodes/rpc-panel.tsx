import { Copy, LockSimple, Play, TerminalWindow } from '@phosphor-icons/react';
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
import { toast } from '@plumba/ui/components/toast';
import { useState } from 'react';
import type { Host, NodeDeployment } from '../../data/demo-workspace';

interface RpcPanelProps {
  node: NodeDeployment;
  host: Host | undefined;
}

const ethereumMethods = [
  { value: 'eth_blockNumber', label: 'eth_blockNumber — latest block' },
  { value: 'net_peerCount', label: 'net_peerCount — connected peers' },
  { value: 'eth_syncing', label: 'eth_syncing — sync status' },
  { value: 'web3_clientVersion', label: 'web3_clientVersion — client version' },
];

const bitcoinMethods = [
  { value: 'getblockchaininfo', label: 'getblockchaininfo — chain status' },
  { value: 'getblockcount', label: 'getblockcount — latest block' },
  {
    value: 'getconnectioncount',
    label: 'getconnectioncount — connected peers',
  },
  { value: 'getnetworkinfo', label: 'getnetworkinfo — client status' },
];

function sampleResult(node: NodeDeployment, method: string): unknown {
  switch (method) {
    case 'eth_blockNumber':
      return `0x${node.blockHeight.toString(16)}`;
    case 'net_peerCount':
      return `0x${node.peers.toString(16)}`;
    case 'eth_syncing':
      return node.syncPercent >= 100
        ? false
        : {
            startingBlock: '0x0',
            currentBlock: `0x${node.blockHeight.toString(16)}`,
            highestBlock: `0x${Math.ceil(node.blockHeight / Math.max(0.01, node.syncPercent / 100)).toString(16)}`,
          };
    case 'web3_clientVersion':
      return `${node.clientId}/${node.version}/preview`;
    case 'getblockcount':
      return node.blockHeight;
    case 'getconnectioncount':
      return node.peers;
    case 'getblockchaininfo':
      return {
        chain:
          node.network === 'Mainnet'
            ? 'main'
            : node.network === 'Testnet'
              ? 'test'
              : 'signet',
        blocks: node.blockHeight,
        verificationprogress: node.syncPercent / 100,
        initialblockdownload: node.syncPercent < 100,
      };
    case 'getnetworkinfo':
      return {
        subversion: `/Satoshi:${node.version}/`,
        connections: node.peers,
        networkactive: true,
      };
    default:
      return null;
  }
}

async function copyText(text: string, title: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.add({ title, type: 'success' });
  } catch {
    toast.add({
      title: 'Clipboard unavailable',
      description: 'Select the displayed text and copy it manually.',
      type: 'error',
    });
  }
}

export function RpcPanel({ node, host }: RpcPanelProps) {
  const methods = node.chain === 'Bitcoin' ? bitcoinMethods : ethereumMethods;
  const [selectedMethod, setSelectedMethod] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const method =
    methods.find((item) => item.value === selectedMethod)?.value ??
    methods[0]?.value ??
    '';
  const endpoint = host ? `http://${host.address}:${node.rpcPort}` : '';
  const request = JSON.stringify(
    { jsonrpc: '2.0', id: 'plumba-preview', method, params: [] },
    null,
    2,
  );
  const canRun =
    node.rpcEnabled &&
    host?.status === 'online' &&
    node.status !== 'stopped' &&
    node.status !== 'disconnected';
  const curl = `curl '${endpoint}' \\\n  -H 'Content-Type: application/json' \\\n  --data '${JSON.stringify({ jsonrpc: '2.0', id: 'plumba-preview', method, params: [] })}'`;

  function runSample() {
    if (!canRun) return;
    setResponse(
      JSON.stringify(
        {
          jsonrpc: '2.0',
          id: 'plumba-preview',
          result: sampleResult(node, method),
        },
        null,
        2,
      ),
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <Alert>
        <LockSimple aria-hidden="true" />
        <AlertTitle>Private RPC access</AlertTitle>
        <AlertDescription>
          RPC addresses belong to the host’s private network. This playground
          displays sample responses locally; it sends no requests and exposes no
          public endpoint.
        </AlertDescription>
      </Alert>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle>Connection</CardTitle>
            <Badge variant="outline">
              {node.rpcEnabled ? 'Private network' : 'RPC disabled'}
            </Badge>
          </div>
          <CardDescription>
            Sample endpoint and access configuration for this deployment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="rpc-endpoint">
                Private host endpoint
              </FieldLabel>
              <div className="flex flex-wrap gap-2">
                <Input
                  id="rpc-endpoint"
                  readOnly
                  value={endpoint || 'Host unavailable'}
                  className="min-w-0 flex-1 font-mono"
                />
                <Button
                  variant="outline"
                  disabled={!endpoint}
                  onClick={() => {
                    void copyText(endpoint, 'Endpoint copied');
                  }}
                >
                  <Copy data-icon="inline-start" aria-hidden="true" /> Copy
                </Button>
              </div>
              <FieldDescription>
                For applications on a trusted private network. Reachability and
                authentication are not configured in this preview.
              </FieldDescription>
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter>
          <p className="text-xs text-muted-foreground">
            Public access: not configured · Authentication: not configured in
            preview · Playground: read-only samples
          </p>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>RPC playground</CardTitle>
          <CardDescription>
            Inspect a read-only JSON-RPC request using sample node state.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="rpc-method">Method</FieldLabel>
              <NativeSelect
                id="rpc-method"
                value={method}
                onChange={(event) => {
                  setSelectedMethod(event.target.value);
                  setResponse(null);
                }}
              >
                {methods.map((item) => (
                  <NativeSelectOption key={item.value} value={item.value}>
                    {item.label}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <FieldDescription>
                Transaction submission, wallet, and administrative methods are
                excluded.
              </FieldDescription>
            </Field>
          </FieldGroup>
          <div className="grid min-w-0 gap-4 lg:grid-cols-2">
            <section className="min-w-0" aria-labelledby="rpc-request-title">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 id="rpc-request-title" className="text-xs">
                  Request
                </h3>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => {
                    void copyText(request, 'JSON request copied');
                  }}
                >
                  <Copy data-icon="inline-start" aria-hidden="true" /> Copy
                </Button>
              </div>
              <pre className="overflow-x-auto border border-border bg-muted/50 p-4 font-mono text-xs leading-6">
                <code>{request}</code>
              </pre>
            </section>
            <section
              className="min-w-0"
              aria-labelledby="rpc-response-title"
              aria-live="polite"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 id="rpc-response-title" className="text-xs">
                  Sample response
                </h3>
                <Badge variant="secondary">Local preview</Badge>
              </div>
              <pre className="min-h-48 overflow-x-auto border border-border bg-muted/50 p-4 font-mono text-xs leading-6">
                <code>
                  {response ??
                    'Run the sample request to inspect its response.'}
                </code>
              </pre>
            </section>
          </div>
          {!canRun && (
            <p className="text-xs text-muted-foreground">
              {!node.rpcEnabled
                ? 'RPC is disabled in this sample deployment.'
                : 'Start the node on an online host to use the sample playground.'}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex flex-wrap gap-2">
          <Button disabled={!canRun} onClick={runSample}>
            <Play data-icon="inline-start" aria-hidden="true" /> Run sample
            request
          </Button>
          <Button
            variant="outline"
            disabled={!endpoint}
            onClick={() => {
              void copyText(curl, 'cURL example copied');
            }}
          >
            <TerminalWindow data-icon="inline-start" aria-hidden="true" /> Copy
            cURL example
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
