import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { DashboardLayout } from './DashboardLayout';
import { HostsPage } from '../features/hosts/HostsPage';
import { NodesPage } from '../features/nodes/NodesPage';
import { OverviewPage } from '../features/overview/OverviewPage';
import { SettingsPage } from '../features/settings/SettingsPage';

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
                <Link className="button button--primary" to="/">
                  Back to overview
                </Link>
              </section>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
