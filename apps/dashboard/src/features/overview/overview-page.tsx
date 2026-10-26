import {
  ArrowRight,
  Check,
  HardDrives,
  LockSimple,
  PlugsConnected,
  Stack,
} from '@phosphor-icons/react';
import { Badge } from '@plumba/ui/components/badge';
import { Button } from '@plumba/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@plumba/ui/components/card';
import { Separator } from '@plumba/ui/components/separator';
import { Link } from 'react-router-dom';
import { PageHeading } from '../../components/page-heading';

export function OverviewPage() {
  return (
    <>
      <PageHeading
        title="Overview"
        description="A home for the infrastructure you run."
      />
      <Card className="welcome-panel" aria-labelledby="welcome-title">
        <CardHeader className="welcome-copy">
          <span className="large-icon" aria-hidden="true">
            <HardDrives size={24} />
          </span>
          <CardTitle>
            <h2 id="welcome-title">It starts with your hardware.</h2>
          </CardTitle>
          <CardDescription>
            Bring your own machine, connect a Plumba agent, and manage your
            blockchain nodes from one place.
          </CardDescription>
        </CardHeader>
        <CardContent className="welcome-visual">
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
        </CardContent>
        <CardFooter className="welcome-actions">
          <Button render={<Link to="/hosts" />} nativeButton={false}>
            Explore host setup
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </Button>
          <span className="welcome-footnote">
            <LockSimple aria-hidden="true" />
            Built to run on infrastructure you control
          </span>
        </CardFooter>
      </Card>
      <section
        className="workspace-status"
        aria-labelledby="workspace-status-title"
      >
        <div className="section-heading">
          <h2 id="workspace-status-title">Workspace status</h2>
          <Link className="text-link" to="/settings">
            View settings <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <Separator />
        <dl className="status-list">
          <div>
            <dt>Dashboard</dt>
            <dd>
              <Badge variant="secondary">
                <Check aria-hidden="true" /> Ready
              </Badge>
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
