import type { ActivityEvent } from '../data/demo-workspace';

export function activityForHost(
  events: ActivityEvent[],
  selectedHostId: string,
) {
  return selectedHostId === 'all'
    ? events
    : events.filter(
        (event) => !event.hostId || event.hostId === selectedHostId,
      );
}
