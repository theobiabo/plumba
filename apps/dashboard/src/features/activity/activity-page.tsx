import {
  ArrowClockwise,
  ArrowRight,
  CheckCircle,
  WarningCircle,
} from '@phosphor-icons/react';
import { Badge } from '@plumba/ui/components/badge';
import { Button } from '@plumba/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@plumba/ui/components/card';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@plumba/ui/components/empty';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@plumba/ui/components/tabs';
import { cn } from '@plumba/ui/lib/utils';
import { Link } from 'react-router-dom';
import { useWorkspace } from '../../app/use-workspace';
import { PageHeading } from '../../components/page-heading';
import type { ActivityEvent } from '../../data/demo-workspace';
import { activityForHost } from '../../lib/activity';

const toneLabels: Record<ActivityEvent['tone'], string> = {
  error: 'Issue',
  warning: 'Attention',
  success: 'Change',
  neutral: 'Event',
};

function EventList({
  events,
  emptyTitle,
  emptyDescription,
}: {
  events: ActivityEvent[];
  emptyTitle: string;
  emptyDescription: string;
}) {
  if (events.length === 0) {
    return (
      <Empty className="border-0 py-14">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CheckCircle aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>{emptyTitle}</EmptyTitle>
          <EmptyDescription>{emptyDescription}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ol className="divide-y divide-border">
      {events.map((event) => (
        <li
          key={event.id}
          className="grid gap-3 py-5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-4"
        >
          <span
            className={cn(
              'hidden size-10 items-center justify-center border border-border bg-muted text-muted-foreground sm:flex',
              event.tone === 'warning' &&
                'border-primary/40 bg-primary/10 text-primary',
              event.tone === 'error' &&
                'border-destructive/40 bg-destructive/10 text-destructive',
            )}
          >
            {event.tone === 'warning' || event.tone === 'error' ? (
              <WarningCircle aria-hidden="true" />
            ) : (
              <CheckCircle aria-hidden="true" />
            )}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-medium text-foreground">
                {event.title}
              </h3>
              <Badge
                variant={event.tone === 'error' ? 'destructive' : 'outline'}
              >
                {toneLabels[event.tone]}
              </Badge>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {event.description}
            </p>
            <span className="mt-2 block font-mono text-xs text-muted-foreground sm:hidden">
              {event.time}
            </span>
          </div>
          <div className="flex items-start gap-3 sm:flex-col sm:items-end">
            <span className="hidden whitespace-nowrap font-mono text-xs text-muted-foreground sm:block">
              {event.time}
            </span>
            {event.target && (
              <Link
                to={event.target}
                className="inline-flex items-center gap-1 text-xs hover:text-primary"
              >
                View <ArrowRight aria-hidden="true" />
              </Link>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function ActivityPage() {
  const { activity, hosts, selectedHostId, isRefreshing, refreshPreview } =
    useWorkspace();
  const selectedHost = hosts.find((host) => host.id === selectedHostId);
  const events = activityForHost(activity, selectedHostId);
  const attention = events.filter(
    (event) => event.tone === 'warning' || event.tone === 'error',
  );
  const changes = events.filter(
    (event) => event.tone === 'success' || event.tone === 'neutral',
  );
  const filters = [
    {
      value: 'all',
      label: 'All events',
      events,
      emptyTitle: 'No activity yet',
      emptyDescription:
        'Sample activity and local preview actions will appear here.',
    },
    {
      value: 'attention',
      label: 'Needs attention',
      events: attention,
      emptyTitle: 'Nothing needs attention',
      emptyDescription: 'No warning or error events match this host scope.',
    },
    {
      value: 'changes',
      label: 'Changes',
      events: changes,
      emptyTitle: 'No changes here',
      emptyDescription: 'There are no change events in this host scope yet.',
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4 [&_.page-heading]:mb-0">
        <PageHeading
          title="Activity"
          description="Sample events and browser-only preview actions. Live telemetry is not connected."
        />
        <Button
          variant="outline"
          size="sm"
          disabled={isRefreshing}
          onClick={() => void refreshPreview()}
        >
          <ArrowClockwise data-icon="inline-start" aria-hidden="true" />
          {isRefreshing ? 'Refreshing preview…' : 'Refresh preview'}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        {selectedHost
          ? `Host-linked events for ${selectedHost.name}, plus workspace events`
          : 'Events across all sample hosts'}
      </p>

      <Card className="gap-0">
        <CardHeader className="border-b border-border pb-5">
          <CardTitle>
            <h2>Event timeline</h2>
          </CardTitle>
          <CardDescription>
            Filter the sample history by issues or changes. Local preview
            actions appear first.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <Tabs defaultValue="all" className="gap-4">
            <TabsList
              variant="line"
              aria-label="Filter activity"
              className="max-w-full overflow-x-auto"
            >
              {filters.map((filter) => (
                <TabsTrigger key={filter.value} value={filter.value}>
                  {filter.label}
                  <span className="text-muted-foreground">
                    {filter.events.length}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
            {filters.map((filter) => (
              <TabsContent key={filter.value} value={filter.value}>
                <EventList
                  events={filter.events}
                  emptyTitle={filter.emptyTitle}
                  emptyDescription={filter.emptyDescription}
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
