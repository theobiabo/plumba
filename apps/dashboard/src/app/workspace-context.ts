import { createContext } from 'react';
import type { WorkspaceContextValue } from './workspace-provider';

export const WorkspaceContext = createContext<WorkspaceContextValue | null>(
  null,
);
