import { ArrowRight, HardDrives } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { PageHeading } from '../../components/PageHeading';

export function HostsPage() {
  return (
    <>
      <PageHeading
        title="Hosts"
        description="The machines that power your blockchain infrastructure."
      />
      <section className="inventory-empty" aria-labelledby="hosts-empty-title">
        <span className="large-icon" aria-hidden="true">
          <HardDrives size={30} weight="duotone" />
        </span>
        <h2 id="hosts-empty-title">Your machines belong here.</h2>
        <p>
          A host is a machine running the Plumba agent. One host can run
          multiple blockchain nodes, with its own storage and resource limits.
        </p>
        <div className="connection-notice">
          <span className="status-dot" aria-hidden="true" />
          Connect a Plumba server before enrolling a host.
        </div>
        <Link className="button button--secondary" to="/settings">
          View connection settings
          <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </section>
      <div className="context-note">
        <h2>Built for machines you control</h2>
        <p>
          The agent runs alongside your nodes and handles local container
          operations. You keep control of the hardware and node data.
        </p>
      </div>
    </>
  );
}
