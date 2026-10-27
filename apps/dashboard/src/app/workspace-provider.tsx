import { toast } from '@plumba/ui/components/toast';
import { useState, type PropsWithChildren } from 'react';
import {
  catalogClients,
  initialActivity,
  initialHosts,
  initialNodes,
  initialVolumes,
  type ActivityEvent,
  type Host,
  type NodeDeployment,
  type StorageVolume,
} from '../data/demo-workspace';
import { WorkspaceContext } from './workspace-context';

export interface InstallNodeInput {
  clientId: string;
  hostId: string;
  network: string;
  version: string;
  volumeId: string;
  name: string;
  rpcPort: number;
}

export type NodeAction = 'start' | 'stop' | 'restart' | 'update';

export interface WorkspaceContextValue {
  hosts: Host[];
  nodes: NodeDeployment[];
  volumes: StorageVolume[];
  activity: ActivityEvent[];
  serverAddress: string;
  ownerName: string;
  sessionTimeoutMinutes: number;
  selectedHostId: string;
  isRefreshing: boolean;
  setSelectedHostId: (id: string) => void;
  installNode: (input: InstallNodeInput) => NodeDeployment;
  performNodeAction: (id: string, action: NodeAction) => boolean;
  removeNode: (id: string, deleteData: boolean) => void;
  saveServerAddress: (address: string) => void;
  savePreferences: (ownerName: string, sessionTimeoutMinutes: number) => void;
  refreshPreview: () => Promise<void>;
  resetPreview: () => void;
}

export function WorkspaceProvider({ children }: PropsWithChildren) {
  const [hosts, setHosts] = useState(initialHosts);
  const [nodes, setNodes] = useState(initialNodes);
  const [volumes, setVolumes] = useState(initialVolumes);
  const [activity, setActivity] = useState(initialActivity);
  const [serverAddress, setServerAddress] = useState('');
  const [ownerName, setOwnerName] = useState('Workspace owner');
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState(30);
  const [selectedHostId, setSelectedHostId] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  function recordActivity(event: Omit<ActivityEvent, 'id' | 'time'>) {
    setActivity((current) => [
      { ...event, id: crypto.randomUUID(), time: 'Just now' },
      ...current,
    ]);
  }

  function installNode(input: InstallNodeInput) {
    const client = catalogClients.find((item) => item.id === input.clientId);
    const host = hosts.find((item) => item.id === input.hostId);
    const volume = volumes.find((item) => item.id === input.volumeId);

    if (!client || client.availability !== 'preview') {
      throw new Error('This client is not available in the interface preview.');
    }
    if (!host || host.status !== 'online') {
      throw new Error('Choose an online host to continue.');
    }
    if (!volume || volume.hostId !== host.id) {
      throw new Error('Choose a volume on the selected host.');
    }
    if (!client.architectures.includes(host.architecture)) {
      throw new Error('The client does not support this host architecture.');
    }
    if (host.cpuCores < client.cpuCores) {
      throw new Error('The host does not meet the CPU requirement.');
    }
    if (
      !client.networks.includes(input.network) ||
      !client.versions.includes(input.version)
    ) {
      throw new Error('Choose a supported network and client version.');
    }
    if (host.memoryTotalGb - host.memoryUsedGb < client.memoryGb) {
      throw new Error('The host does not have enough available memory.');
    }
    if (volume.capacityGb - volume.usedGb < client.storageGb) {
      throw new Error('The selected volume does not have enough free space.');
    }
    if (
      !Number.isInteger(input.rpcPort) ||
      input.rpcPort < 1 ||
      input.rpcPort > 65535
    ) {
      throw new Error('Enter a valid RPC port between 1 and 65535.');
    }
    if (
      nodes.some(
        (node) => node.hostId === host.id && node.rpcPort === input.rpcPort,
      )
    ) {
      throw new Error('That RPC port is already assigned on this host.');
    }
    if (
      input.name.trim().length < 3 ||
      nodes.some(
        (node) => node.name.toLowerCase() === input.name.trim().toLowerCase(),
      )
    ) {
      throw new Error('Use a unique node name with at least three characters.');
    }

    const deployment: NodeDeployment = {
      id: crypto.randomUUID(),
      name: input.name.trim(),
      clientId: client.id,
      chain: client.chain,
      network: input.network,
      hostId: host.id,
      status: 'syncing',
      syncPercent: 0,
      blockHeight: 0,
      peers: 0,
      diskUsedGb: 0,
      version: input.version,
      rpcPort: input.rpcPort,
      rpcEnabled: false,
      volumeId: volume.id,
      lastUpdate: 'Just now',
      cpuHistory: Array(12).fill(0),
      memoryHistory: Array(12).fill(0),
      diskHistory: Array(12).fill(0),
    };

    setNodes((current) => [deployment, ...current]);
    recordActivity({
      title: 'Preview deployment created',
      description: `${deployment.name} was added to this browser preview. No host was changed.`,
      tone: 'success',
      hostId: host.id,
      target: `/nodes/${deployment.id}`,
    });
    toast.add({
      title: 'Preview deployment added',
      description: 'No node was installed on your hardware.',
      type: 'success',
    });
    return deployment;
  }

  function performNodeAction(id: string, action: NodeAction) {
    const node = nodes.find((item) => item.id === id);
    const host = hosts.find((item) => item.id === node?.hostId);

    if (!node || !host || host.status !== 'online') {
      toast.add({
        title: 'Action unavailable',
        description: 'This node or its host is not available in the preview.',
        type: 'error',
      });
      return false;
    }

    const latestVersion = catalogClients.find(
      (item) => item.id === node.clientId,
    )?.versions[0];
    const nextStatus = action === 'stop' ? 'stopped' : 'running';
    setNodes((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status: nextStatus,
              peers: action === 'stop' ? 0 : item.peers,
              version:
                action === 'update' && latestVersion
                  ? latestVersion
                  : item.version,
              lastUpdate: 'Just now',
            }
          : item,
      ),
    );

    const labels: Record<NodeAction, string> = {
      start: 'started',
      stop: 'stopped',
      restart: 'restarted',
      update: 'updated',
    };
    recordActivity({
      title: `Preview node ${labels[action]}`,
      description: `${node.name} changed in this browser preview only.`,
      tone: 'neutral',
      hostId: host.id,
      target: `/nodes/${id}`,
    });
    toast.add({
      title: `Preview node ${labels[action]}`,
      description: 'No command was sent to a host.',
      type: 'info',
    });
    return true;
  }

  function removeNode(id: string, deleteData: boolean) {
    const node = nodes.find((item) => item.id === id);
    if (!node) return;

    setNodes((current) => current.filter((item) => item.id !== id));
    if (deleteData) {
      setVolumes((current) =>
        current.map((volume) =>
          volume.id === node.volumeId
            ? {
                ...volume,
                usedGb: Math.max(0, volume.usedGb - node.diskUsedGb),
              }
            : volume,
        ),
      );
      setHosts((current) =>
        current.map((host) =>
          host.id === node.hostId
            ? {
                ...host,
                diskUsedGb: Math.max(0, host.diskUsedGb - node.diskUsedGb),
              }
            : host,
        ),
      );
    }
    recordActivity({
      title: deleteData
        ? 'Preview deployment and data removed'
        : 'Preview deployment removed',
      description: deleteData
        ? `${node.name} and its sample disk usage were removed from this browser preview. Host files were untouched.`
        : `${node.name} was removed from this browser preview. Its sample disk usage was retained.`,
      tone: 'warning',
      hostId: node.hostId,
    });
    toast.add({
      title: 'Preview entry removed',
      description: 'No host files or deployment were changed.',
      type: 'info',
    });
  }

  function saveServerAddress(address: string) {
    setServerAddress(address.trim());
    toast.add({
      title: 'Address saved for this preview',
      description: 'A management-server connection was not established.',
      type: 'info',
    });
  }

  function savePreferences(name: string, timeout: number) {
    setOwnerName(name.trim());
    setSessionTimeoutMinutes(timeout);
    toast.add({
      title: 'Preview preferences saved',
      description: 'These settings reset when the page is reloaded.',
      type: 'success',
    });
  }

  async function refreshPreview() {
    setIsRefreshing(true);
    await new Promise((resolve) => window.setTimeout(resolve, 650));
    setIsRefreshing(false);
    toast.add({
      title: 'Preview refreshed',
      description: 'Sample data is unchanged. Live telemetry is not connected.',
      type: 'info',
    });
  }

  function resetPreview() {
    setHosts(initialHosts);
    setNodes(initialNodes);
    setVolumes(initialVolumes);
    setActivity(initialActivity);
    setServerAddress('');
    setOwnerName('Workspace owner');
    setSessionTimeoutMinutes(30);
    setSelectedHostId('all');
    toast.add({
      title: 'Sample workspace restored',
      description: 'Local preview changes have been cleared.',
      type: 'success',
    });
  }

  const value: WorkspaceContextValue = {
    hosts,
    nodes,
    volumes,
    activity,
    serverAddress,
    ownerName,
    sessionTimeoutMinutes,
    selectedHostId,
    isRefreshing,
    setSelectedHostId,
    installNode,
    performNodeAction,
    removeNode,
    saveServerAddress,
    savePreferences,
    refreshPreview,
    resetPreview,
  };

  return <WorkspaceContext value={value}>{children}</WorkspaceContext>;
}
