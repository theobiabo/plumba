import { Button } from '@plumba/ui/components/button';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { DashboardLayout } from './dashboard-layout';
import { HostsPage } from '../features/hosts/hosts-page';
import { NodesPage } from '../features/nodes/nodes-page';
import { OverviewPage } from '../features/overview/overview-page';
import { SettingsPage } from '../features/settings/settings-page';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route index element={<OverviewPage />} />
          <Route path="hosts" element={<HostsPage />} />
          <Route path="nodes" element={<NodesPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route
            path="*"
            element={
              <section className="not-found">
                <h1>Page not found</h1>
                <p>This page does not exist in your dashboard.</p>
                <Button render={<Link to="/" />} nativeButton={false}>
                  Back to overview
                </Button>
              </section>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
