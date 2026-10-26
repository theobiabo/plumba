import {
  ArrowRight,
  Check,
  HardDrives,
  LockSimple,
  PlugsConnected,
  Stack,
} from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { PageHeading } from '../../components/PageHeading';

export function OverviewPage() {
  return (
    <>
      <PageHeading
        title="Overview"
        description="A home for the infrastructure you run."
      />
      <section className="welcome-panel" aria-labelledby="welcome-title">
        <div className="welcome-content">
          <span className="large-icon" aria-hidden="true">
            <HardDrives size={30} weight="duotone" />
          </span>
          <h2 id="welcome-title">It starts with your hardware.</h2>
          <p>
            Bring your own machine, connect a Plumba agent, and manage your
            blockchain nodes from one place.
          </p>
          <Link className="button button--primary" to="/hosts">
            Explore host setup
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
          <span className="welcome-footnote">
            <LockSimple size={14} aria-hidden="true" />
            Built to run on infrastructure you control
          </span>
        </div>
        <div
          className="infrastructure-path"
          aria-label="Your hardware connects through a Plumba agent to your blockchain nodes"
        >
          <div className="path-item">
            <span className="path-icon">
              <HardDrives size={24} aria-hidden="true" />
            </span>
            <span>Your hardware</span>
            <span className="path-detail">A machine you own</span>
          </div>
          <span className="path-connector" aria-hidden="true" />
          <div className="path-item">
            <span className="path-icon path-icon--accent">
              <PlugsConnected size={24} aria-hidden="true" />
            </span>
            <span>Plumba agent</span>
            <span className="path-detail">The local connection</span>
          </div>
          <span className="path-connector" aria-hidden="true" />
          <div className="path-item">
            <span className="path-icon">
              <Stack size={24} aria-hidden="true" />
            </span>
            <span>Your nodes</span>
            <span className="path-detail">Clients you choose</span>
          </div>
        </div>
      </section>
      <section
        className="workspace-status"
        aria-labelledby="workspace-status-title"
      >
        <div className="section-heading">
          <h2 id="workspace-status-title">Workspace status</h2>
          <Link className="text-link" to="/settings">
            View settings <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
        <dl className="status-list">
          <div>
            <dt>Dashboard</dt>
            <dd className="ready-status">
              <Check size={16} aria-hidden="true" /> Ready
            </dd>
          </div>
          <div>
            <dt>Server connection</dt>
            <dd>Not configured</dd>
          </div>
          <div>
            <dt>Host and node inventory</dt>
            <dd>Waiting for a server connection</dd>
          </div>
        </dl>
        <p className="status-explanation">
          Live health, logs, and sync progress will appear after the dashboard
          is connected to your Plumba server.
        </p>
      </section>
    </>
  );
}
