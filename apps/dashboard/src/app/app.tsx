import { Button } from '@plumba/ui/components/button';
import { Toaster } from '@plumba/ui/components/toast';
import { lazy } from 'react';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { DashboardLayout } from './dashboard-layout';
import { WorkspaceProvider } from './workspace-provider';

const OverviewPage = lazy(() =>
  import('../features/overview/overview-page').then(({ OverviewPage }) => ({
    default: OverviewPage,
  })),
);
const CatalogPage = lazy(() =>
  import('../features/catalog/catalog-page').then(({ CatalogPage }) => ({
    default: CatalogPage,
  })),
);
const NodesPage = lazy(() =>
  import('../features/nodes/nodes-page').then(({ NodesPage }) => ({
    default: NodesPage,
  })),
);
const NodeDetailPage = lazy(() =>
  import('../features/nodes/node-detail-page').then(({ NodeDetailPage }) => ({
    default: NodeDetailPage,
  })),
);
const HostsPage = lazy(() =>
  import('../features/hosts/hosts-page').then(({ HostsPage }) => ({
    default: HostsPage,
  })),
);
const StoragePage = lazy(() =>
  import('../features/storage/storage-page').then(({ StoragePage }) => ({
    default: StoragePage,
  })),
);
const ActivityPage = lazy(() =>
  import('../features/activity/activity-page').then(({ ActivityPage }) => ({
    default: ActivityPage,
  })),
);
const SettingsPage = lazy(() =>
  import('../features/settings/settings-page').then(({ SettingsPage }) => ({
    default: SettingsPage,
  })),
);

export function App() {
  return (
    <Toaster>
      <WorkspaceProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<DashboardLayout />}>
              <Route index element={<OverviewPage />} />
              <Route path="catalog" element={<CatalogPage />} />
              <Route path="nodes" element={<NodesPage />} />
              <Route path="nodes/:nodeId" element={<NodeDetailPage />} />
              <Route path="hosts" element={<HostsPage />} />
              <Route path="storage" element={<StoragePage />} />
              <Route path="activity" element={<ActivityPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route
                path="*"
                element={
                  <section className="flex min-h-[45vh] flex-col items-start justify-center gap-3">
                    <h1 className="font-mono text-2xl">Page not found</h1>
                    <p className="text-sm text-muted-foreground">
                      This page does not exist in your dashboard.
                    </p>
                    <Button render={<Link to="/" />} nativeButton={false}>
                      Back to overview
                    </Button>
                  </section>
                }
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </WorkspaceProvider>
    </Toaster>
  );
}
