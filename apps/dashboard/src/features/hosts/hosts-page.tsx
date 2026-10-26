import { ArrowRight, HardDrives } from '@phosphor-icons/react';
import { Button } from '@plumba/ui/components/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@plumba/ui/components/empty';
import { Link } from 'react-router-dom';
import { PageHeading } from '../../components/page-heading';

export function HostsPage() {
  return (
    <>
      <PageHeading
        title="Hosts"
        description="The machines that power your blockchain infrastructure."
      />
      <Empty className="inventory-empty" aria-labelledby="hosts-empty-title">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HardDrives aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>
            <h2 id="hosts-empty-title">Your machines belong here.</h2>
          </EmptyTitle>
          <EmptyDescription>
            A host is a machine running the Plumba agent. One host can run
            multiple blockchain nodes, with its own storage and resource limits.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <p className="connection-notice">
            Connect a Plumba server before enrolling a host.
          </p>
          <Button
            variant="outline"
            render={<Link to="/settings" />}
            nativeButton={false}
          >
            View connection settings
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </Button>
        </EmptyContent>
      </Empty>
      <section className="context-note" aria-labelledby="hosts-context-title">
        <h2 id="hosts-context-title">Built for machines you control</h2>
        <p>
          The agent runs alongside your nodes and handles local container
          operations. You keep control of the hardware and node data.
        </p>
      </section>
    </>
  );
}
