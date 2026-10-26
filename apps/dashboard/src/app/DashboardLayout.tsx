import {
  ArrowUpRight,
  Cube,
  GearSix,
  House,
  List,
  Plugs,
  Stack,
  HardDrives,
  X,
} from '@phosphor-icons/react';
import { useState } from 'react';
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

  return (
    <div className="dashboard">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <aside className={`sidebar${navigationOpen ? ' sidebar--open' : ''}`}>
        <div className="sidebar-heading">
          <NavLink
            className="brand"
            to="/"
            aria-label="Plumba overview"
            onClick={() => setNavigationOpen(false)}
          >
            <span className="brand-mark">
              <Cube size={22} weight="duotone" aria-hidden="true" />
            </span>
            <span>plumba</span>
          </NavLink>
          <button
            className="icon-button navigation-toggle"
            type="button"
            aria-label={navigationOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={navigationOpen}
            aria-controls="primary-navigation"
            onClick={() => setNavigationOpen(!navigationOpen)}
          >
            {navigationOpen ? (
              <X size={22} aria-hidden="true" />
            ) : (
              <List size={22} aria-hidden="true" />
            )}
          </button>
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
              className={({ isActive }) =>
                `nav-link${isActive ? ' nav-link--active' : ''}`
              }
              onClick={() => setNavigationOpen(false)}
            >
              <Icon size={20} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="ownership-note">
            <span className="ownership-symbol" aria-hidden="true">
              <Plugs size={20} />
            </span>
            <p>
              Your hardware.
              <br />
              Your infrastructure.
            </p>
          </div>
          <NavLink className="footer-link" to="/settings">
            Connection settings
            <ArrowUpRight size={16} aria-hidden="true" />
          </NavLink>
          <span className="sidebar-version">Open source · Self-hosted</span>
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
          <span className="connection-status">
            <span className="status-dot" aria-hidden="true" />
            Server not connected
          </span>
        </header>
        <main id="main-content" className="main-content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
