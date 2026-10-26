import { ArrowRight, Stack } from '@phosphor-icons/react';
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

export function NodesPage() {
  return (
    <>
      <PageHeading
        title="Nodes"
        description="Deploy, manage, and monitor your blockchain clients."
      />
      <Empty className="inventory-empty" aria-labelledby="nodes-empty-title">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Stack aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>
            <h2 id="nodes-empty-title">Give your nodes a place to run.</h2>
          </EmptyTitle>
          <EmptyDescription>
            Node deployments run on connected hosts. Connect your server and
            enroll a host to make its resources available for your blockchain
            clients.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <p className="connection-notice">
            Node inventory is unavailable until a server is connected.
          </p>
          <Button
            variant="outline"
            render={<Link to="/hosts" />}
            nativeButton={false}
          >
            Explore host setup
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </Button>
        </EmptyContent>
      </Empty>
    </>
  );
}
