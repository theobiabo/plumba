import { ArrowRight, Stack } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';
import { PageHeading } from '../../components/PageHeading';

export function NodesPage() {
  return (
    <>
      <PageHeading
        title="Nodes"
        description="Deploy, manage, and monitor your blockchain clients."
      />
      <section className="inventory-empty" aria-labelledby="nodes-empty-title">
        <span className="large-icon" aria-hidden="true">
          <Stack size={30} weight="duotone" />
        </span>
        <h2 id="nodes-empty-title">Give your nodes a place to run.</h2>
        <p>
          Node deployments run on connected hosts. Connect your server and
          enroll a host to make its resources available for your blockchain
          clients.
        </p>
        <div className="connection-notice">
          <span className="status-dot" aria-hidden="true" />
          Node inventory is unavailable until a server is connected.
        </div>
        <Link className="button button--secondary" to="/hosts">
          Explore host setup
          <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </section>
    </>
  );
}
