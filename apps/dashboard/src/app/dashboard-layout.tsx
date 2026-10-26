import {
  ArrowUpRight,
  GearSix,
  HardDrives,
  House,
  List,
  Plugs,
  Stack,
  X,
} from '@phosphor-icons/react';
import { Badge } from '@plumba/ui/components/badge';
import { Button } from '@plumba/ui/components/button';
import { useLayoutEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

const navigation = [
  { to: '/', label: 'Overview', icon: House },
  { to: '/hosts', label: 'Hosts', icon: HardDrives },
  { to: '/nodes', label: 'Nodes', icon: Stack },
  { to: '/settings', label: 'Settings', icon: GearSix },
];

export function DashboardLayout() {
  const [navigationOpen, setNavigationOpen] = useState(false);
  const { pathname } = useLocation();
  const currentPage = navigation.find((item) => item.to === pathname);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="dashboard">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <aside className="sidebar" data-open={navigationOpen}>
        <div className="sidebar-heading">
          <NavLink
            className="brand"
            to="/"
            aria-label="Plumba overview"
            onClick={() => setNavigationOpen(false)}
          >
            plumba
          </NavLink>
          <Button
            className="navigation-toggle"
            variant="ghost"
            size="icon"
            type="button"
            aria-label={navigationOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={navigationOpen}
            aria-controls="primary-navigation"
            onClick={() => setNavigationOpen(!navigationOpen)}
          >
            {navigationOpen ? (
              <X aria-hidden="true" />
            ) : (
              <List aria-hidden="true" />
            )}
          </Button>
        </div>
        <nav
          id="primary-navigation"
          className="navigation"
          aria-label="Main navigation"
        >
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className="nav-link"
              onClick={() => setNavigationOpen(false)}
            >
              <Icon aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <p className="ownership-note">
            Your hardware.
            <br />
            Your infrastructure.
          </p>
          <NavLink className="footer-link" to="/settings">
            Connection settings
            <ArrowUpRight aria-hidden="true" />
          </NavLink>
          <span className="sidebar-version">Open source · Self hosted</span>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb" aria-label="Current section">
            <span>Workspace</span>
            <span className="breadcrumb-divider" aria-hidden="true">
              /
            </span>
            <span>{currentPage?.label ?? 'Page not found'}</span>
          </div>
          <Badge variant="outline" className="connection-status">
            <Plugs aria-hidden="true" />
            Server not connected
          </Badge>
        </header>
        <main id="main-content" className="main-content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
