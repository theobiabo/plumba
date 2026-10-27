export type NodeStatus =
  'ready' | 'running' | 'syncing' | 'stalled' | 'stopped' | 'disconnected';

export type HostStatus = 'online' | 'offline';
export type Architecture = 'x86_64' | 'arm64';
export type ActivityTone = 'success' | 'warning' | 'error' | 'neutral';

export interface Host {
  id: string;
  name: string;
  address: string;
  architecture: Architecture;
  status: HostStatus;
  cpuCores: number;
  cpuPercent: number;
  memoryUsedGb: number;
  memoryTotalGb: number;
  diskUsedGb: number;
  diskTotalGb: number;
  lastContact: string;
  cpuHistory: number[];
  memoryHistory: number[];
  diskHistory: number[];
}

export interface CatalogClient {
  id: string;
  chain: string;
  client: string;
  description: string;
  networks: string[];
  architectures: Architecture[];
  cpuCores: number;
  memoryGb: number;
  storageGb: number;
  defaultRpcPort: number;
  versions: string[];
  availability: 'preview' | 'planned';
  initials: string;
}

export interface NodeDeployment {
  id: string;
  name: string;
  clientId: string;
  chain: string;
  network: string;
  hostId: string;
  status: NodeStatus;
  syncPercent: number;
  blockHeight: number;
  peers: number;
  diskUsedGb: number;
  version: string;
  rpcPort: number;
  rpcEnabled: boolean;
  volumeId: string;
  lastUpdate: string;
  cpuHistory: number[];
  memoryHistory: number[];
  diskHistory: number[];
}

export interface StorageVolume {
  id: string;
  hostId: string;
  name: string;
  path: string;
  type: string;
  capacityGb: number;
  usedGb: number;
}

export interface ActivityEvent {
  id: string;
  title: string;
  description: string;
  time: string;
  tone: ActivityTone;
  hostId?: string;
  target?: string;
}

export const catalogClients: CatalogClient[] = [
  {
    id: 'geth',
    chain: 'Ethereum',
    client: 'Geth',
    description:
      'Execution client for Ethereum networks with JSON-RPC support.',
    networks: ['Mainnet', 'Sepolia'],
    architectures: ['x86_64', 'arm64'],
    cpuCores: 4,
    memoryGb: 16,
    storageGb: 1200,
    defaultRpcPort: 8545,
    versions: ['1.16.5', '1.16.4'],
    availability: 'preview',
    initials: 'ETH',
  },
  {
    id: 'bitcoin-core',
    chain: 'Bitcoin',
    client: 'Bitcoin Core',
    description: 'Full validation node with local wallet and RPC interfaces.',
    networks: ['Mainnet', 'Testnet', 'Signet'],
    architectures: ['x86_64', 'arm64'],
    cpuCores: 4,
    memoryGb: 8,
    storageGb: 900,
    defaultRpcPort: 8332,
    versions: ['30.0', '29.2'],
    availability: 'preview',
    initials: 'BTC',
  },
  {
    id: 'nethermind',
    chain: 'Ethereum',
    client: 'Nethermind',
    description:
      'Ethereum execution client with configurable sync and pruning.',
    networks: ['Mainnet', 'Sepolia'],
    architectures: ['x86_64'],
    cpuCores: 8,
    memoryGb: 32,
    storageGb: 1500,
    defaultRpcPort: 8545,
    versions: ['1.33.0', '1.32.3'],
    availability: 'preview',
    initials: 'ETH',
  },
  {
    id: 'agave',
    chain: 'Solana',
    client: 'Agave',
    description: 'High-throughput validator client for Solana clusters.',
    networks: ['Mainnet Beta', 'Devnet'],
    architectures: ['x86_64'],
    cpuCores: 16,
    memoryGb: 256,
    storageGb: 2000,
    defaultRpcPort: 8899,
    versions: [],
    availability: 'planned',
    initials: 'SOL',
  },
  {
    id: 'erigon',
    chain: 'Ethereum',
    client: 'Erigon',
    description: 'Execution client focused on efficient archival access.',
    networks: ['Mainnet'],
    architectures: ['x86_64'],
    cpuCores: 8,
    memoryGb: 32,
    storageGb: 2000,
    defaultRpcPort: 8545,
    versions: [],
    availability: 'planned',
    initials: 'ETH',
  },
];

export const initialHosts: Host[] = [
  {
    id: 'atlas-01',
    name: 'atlas-01',
    address: '192.168.1.24',
    architecture: 'x86_64',
    status: 'online',
    cpuCores: 16,
    cpuPercent: 36,
    memoryUsedGb: 28.4,
    memoryTotalGb: 64,
    diskUsedGb: 2380,
    diskTotalGb: 4000,
    lastContact: '18 seconds ago',
    cpuHistory: [28, 31, 26, 35, 38, 34, 37, 42, 33, 36, 39, 36],
    memoryHistory: [39, 40, 40, 41, 42, 42, 43, 44, 44, 44, 45, 44],
    diskHistory: [55, 56, 56, 57, 57, 58, 58, 59, 59, 59, 60, 60],
  },
  {
    id: 'forge-02',
    name: 'forge-02',
    address: '192.168.1.36',
    architecture: 'x86_64',
    status: 'online',
    cpuCores: 12,
    cpuPercent: 68,
    memoryUsedGb: 42.1,
    memoryTotalGb: 64,
    diskUsedGb: 2710,
    diskTotalGb: 3200,
    lastContact: '43 seconds ago',
    cpuHistory: [42, 48, 51, 56, 62, 58, 67, 72, 65, 69, 71, 68],
    memoryHistory: [57, 59, 60, 61, 63, 63, 64, 65, 65, 66, 66, 66],
    diskHistory: [78, 79, 80, 80, 81, 82, 82, 83, 83, 84, 84, 85],
  },
  {
    id: 'lab-03',
    name: 'lab-03',
    address: '192.168.1.52',
    architecture: 'arm64',
    status: 'offline',
    cpuCores: 8,
    cpuPercent: 0,
    memoryUsedGb: 0,
    memoryTotalGb: 16,
    diskUsedGb: 912,
    diskTotalGb: 1000,
    lastContact: '27 minutes ago',
    cpuHistory: [21, 18, 23, 22, 24, 16, 12, 7, 0, 0, 0, 0],
    memoryHistory: [37, 37, 38, 38, 38, 38, 38, 36, 0, 0, 0, 0],
    diskHistory: [90, 90, 90, 91, 91, 91, 91, 91, 91, 91, 91, 91],
  },
];

export const initialVolumes: StorageVolume[] = [
  {
    id: 'atlas-nvme',
    hostId: 'atlas-01',
    name: 'Primary NVMe',
    path: '/mnt/nodes',
    type: 'NVMe SSD',
    capacityGb: 4000,
    usedGb: 2380,
  },
  {
    id: 'forge-ssd',
    hostId: 'forge-02',
    name: 'Node data',
    path: '/srv/plumba',
    type: 'SSD',
    capacityGb: 3200,
    usedGb: 2710,
  },
  {
    id: 'lab-ssd',
    hostId: 'lab-03',
    name: 'Local disk',
    path: '/data',
    type: 'SSD',
    capacityGb: 1000,
    usedGb: 912,
  },
];

export const initialNodes: NodeDeployment[] = [
  {
    id: 'eth-mainnet-01',
    name: 'ethereum-mainnet',
    clientId: 'geth',
    chain: 'Ethereum',
    network: 'Mainnet',
    hostId: 'atlas-01',
    status: 'ready',
    syncPercent: 100,
    blockHeight: 22_184_731,
    peers: 46,
    diskUsedGb: 1430,
    version: '1.16.5',
    rpcPort: 8545,
    rpcEnabled: true,
    volumeId: 'atlas-nvme',
    lastUpdate: '2 minutes ago',
    cpuHistory: [28, 30, 27, 33, 32, 29, 34, 36, 31, 35, 36, 33],
    memoryHistory: [42, 43, 43, 44, 44, 43, 45, 44, 44, 45, 45, 44],
    diskHistory: [31, 32, 32, 33, 33, 34, 34, 35, 35, 35, 36, 36],
  },
  {
    id: 'btc-mainnet-01',
    name: 'bitcoin-mainnet',
    clientId: 'bitcoin-core',
    chain: 'Bitcoin',
    network: 'Mainnet',
    hostId: 'forge-02',
    status: 'syncing',
    syncPercent: 68,
    blockHeight: 852_461,
    peers: 12,
    diskUsedGb: 610,
    version: '30.0',
    rpcPort: 8332,
    rpcEnabled: true,
    volumeId: 'forge-ssd',
    lastUpdate: '36 seconds ago',
    cpuHistory: [48, 53, 57, 62, 66, 64, 71, 69, 73, 67, 71, 68],
    memoryHistory: [48, 49, 50, 52, 53, 53, 54, 54, 55, 55, 55, 56],
    diskHistory: [16, 16, 17, 17, 18, 18, 18, 19, 19, 19, 19, 19],
  },
  {
    id: 'eth-sepolia-01',
    name: 'ethereum-sepolia',
    clientId: 'nethermind',
    chain: 'Ethereum',
    network: 'Sepolia',
    hostId: 'atlas-01',
    status: 'running',
    syncPercent: 100,
    blockHeight: 8_721_303,
    peers: 24,
    diskUsedGb: 318,
    version: '1.33.0',
    rpcPort: 8546,
    rpcEnabled: true,
    volumeId: 'atlas-nvme',
    lastUpdate: '1 minute ago',
    cpuHistory: [19, 22, 24, 21, 18, 20, 21, 23, 22, 21, 22, 20],
    memoryHistory: [28, 28, 29, 30, 30, 30, 31, 30, 30, 31, 31, 31],
    diskHistory: [7, 7, 7, 8, 8, 8, 8, 8, 8, 8, 8, 8],
  },
  {
    id: 'btc-signet-01',
    name: 'bitcoin-signet',
    clientId: 'bitcoin-core',
    chain: 'Bitcoin',
    network: 'Signet',
    hostId: 'lab-03',
    status: 'disconnected',
    syncPercent: 94,
    blockHeight: 215_801,
    peers: 0,
    diskUsedGb: 78,
    version: '29.2',
    rpcPort: 38332,
    rpcEnabled: false,
    volumeId: 'lab-ssd',
    lastUpdate: '27 minutes ago',
    cpuHistory: [13, 11, 10, 9, 10, 8, 6, 3, 0, 0, 0, 0],
    memoryHistory: [17, 18, 18, 18, 18, 17, 17, 16, 0, 0, 0, 0],
    diskHistory: [8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8],
  },
  {
    id: 'eth-sepolia-02',
    name: 'sepolia-archive',
    clientId: 'geth',
    chain: 'Ethereum',
    network: 'Sepolia',
    hostId: 'forge-02',
    status: 'stalled',
    syncPercent: 91,
    blockHeight: 8_603_077,
    peers: 2,
    diskUsedGb: 721,
    version: '1.16.4',
    rpcPort: 8547,
    rpcEnabled: false,
    volumeId: 'forge-ssd',
    lastUpdate: '18 minutes ago',
    cpuHistory: [42, 37, 34, 27, 18, 15, 11, 9, 7, 5, 4, 3],
    memoryHistory: [53, 53, 52, 51, 49, 48, 47, 47, 47, 47, 47, 47],
    diskHistory: [20, 20, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22],
  },
  {
    id: 'btc-testnet-01',
    name: 'bitcoin-testnet',
    clientId: 'bitcoin-core',
    chain: 'Bitcoin',
    network: 'Testnet',
    hostId: 'forge-02',
    status: 'stopped',
    syncPercent: 100,
    blockHeight: 4_918_224,
    peers: 0,
    diskUsedGb: 113,
    version: '30.0',
    rpcPort: 18332,
    rpcEnabled: false,
    volumeId: 'forge-ssd',
    lastUpdate: '4 hours ago',
    cpuHistory: [16, 13, 12, 8, 7, 3, 0, 0, 0, 0, 0, 0],
    memoryHistory: [21, 20, 20, 18, 17, 16, 0, 0, 0, 0, 0, 0],
    diskHistory: [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
  },
];

export const initialActivity: ActivityEvent[] = [
  {
    id: 'event-1',
    title: 'Sync needs attention',
    description: 'sepolia-archive has not advanced for 18 minutes.',
    time: '18 minutes ago',
    tone: 'warning',
    hostId: 'forge-02',
    target: '/nodes/eth-sepolia-02',
  },
  {
    id: 'event-2',
    title: 'Host disconnected',
    description: 'lab-03 last contacted the server 27 minutes ago.',
    time: '27 minutes ago',
    tone: 'error',
    hostId: 'lab-03',
    target: '/hosts',
  },
  {
    id: 'event-3',
    title: 'Node version changed',
    description: 'ethereum-mainnet is shown on Geth 1.16.5.',
    time: '2 hours ago',
    tone: 'success',
    hostId: 'atlas-01',
    target: '/nodes/eth-mainnet-01',
  },
  {
    id: 'event-4',
    title: 'Volume approaching capacity',
    description: 'Local disk on lab-03 has 88 GB remaining.',
    time: '5 hours ago',
    tone: 'warning',
    hostId: 'lab-03',
    target: '/storage',
  },
  {
    id: 'event-5',
    title: 'Host enrolled',
    description: 'forge-02 appeared in the sample workspace.',
    time: 'Yesterday',
    tone: 'neutral',
    hostId: 'forge-02',
    target: '/hosts',
  },
];
