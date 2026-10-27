import {
  ArrowRight,
  ClockCounterClockwise,
  Database,
  GearSix,
  HardDrives,
  House,
  Info,
  List,
  Plus,
  SquaresFour,
  Stack,
} from '@phosphor-icons/react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@plumba/ui/components/alert';
import { Button } from '@plumba/ui/components/button';
import { Field, FieldLabel } from '@plumba/ui/components/field';
import {
  NativeSelect,
  NativeSelectOption,
} from '@plumba/ui/components/native-select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@plumba/ui/components/sheet';
import { Skeleton } from '@plumba/ui/components/skeleton';
import { cn } from '@plumba/ui/lib/utils';
import { Suspense, useLayoutEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { StatusBadge } from '../components/status-badge';
import { useWorkspace } from './use-workspace';

const navigation = [
  {
    label: 'Workspace',
    items: [
      { to: '/', label: 'Overview', icon: House },
      { to: '/catalog', label: 'Node Catalog', icon: SquaresFour },
      { to: '/nodes', label: 'My Nodes', icon: Stack },
    ],
  },
  {
    label: 'Infrastructure',
    items: [
      { to: '/hosts', label: 'Hosts', icon: HardDrives },
      { to: '/storage', label: 'Storage', icon: Database },
    ],
  },
  {
    label: 'Administration',
    items: [
      { to: '/activity', label: 'Activity', icon: ClockCounterClockwise },
      { to: '/settings', label: 'Settings', icon: GearSix },
    ],
  },
] as const;

const navigationItems: { to: string; label: string }[] = navigation.flatMap(
  (group) => group.items.map(({ to, label }) => ({ to, label })),
);

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <>
      <div className="flex items-center gap-3 border-b border-sidebar-border px-4 py-4">
        <span className="grid size-8 place-items-center rounded-sm bg-primary text-primary-foreground">
          <Stack size={18} weight="bold" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <Link
            to="/"
            className="text-base font-semibold text-sidebar-foreground"
            onClick={onNavigate}
          >
            plumba
          </Link>
          <p className="text-[11px] leading-4 text-muted-foreground">
            Node operations
          </p>
        </div>
      </div>

      <nav
        className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-2 py-4"
        aria-label="Main navigation"
      >
        {navigation.map((group) => (
          <div key={group.label} className="flex flex-col gap-1">
            <p className="px-3 pb-2 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
              {group.label}
            </p>
            {group.items.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-9 items-center gap-3 rounded-sm px-3 text-[13px] text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    isActive &&
                      'bg-sidebar-accent font-medium text-sidebar-accent-foreground',
                  )
                }
              >
                <Icon size={18} aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border px-3 py-4">
        <p className="mb-2 px-1 text-[10px] tracking-[0.14em] text-muted-foreground uppercase">
          Management server
        </p>
        <Link
          to="/settings"
          onClick={onNavigate}
          className="flex items-center justify-between gap-2 rounded-sm px-2 py-2 transition-colors hover:bg-sidebar-accent"
        >
          <div className="flex flex-col items-start gap-1.5">
            <StatusBadge status="disconnected" />
            <span className="text-[11px] text-muted-foreground">
              Configure connection
            </span>
          </div>
          <ArrowRight
            size={15}
            className="text-muted-foreground"
            aria-hidden="true"
          />
        </Link>
        <p className="mt-4 px-1 text-[10px] text-muted-foreground">
          Open source · Self hosted
        </p>
      </div>
    </>
  );
}

function HostContext() {
  const { hosts, selectedHostId, setSelectedHostId } = useWorkspace();

  return (
    <Field className="min-w-0">
      <FieldLabel htmlFor="host-context" className="sr-only">
        Host context
      </FieldLabel>
      <NativeSelect
        id="host-context"
        className="w-[155px] max-w-full"
        value={selectedHostId}
        onChange={(event) => setSelectedHostId(event.target.value)}
      >
        <NativeSelectOption value="all">All hosts</NativeSelectOption>
        {hosts.map((host) => (
          <NativeSelectOption key={host.id} value={host.id}>
            {host.name}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </Field>
  );
}

export function DashboardLayout() {
  const [navigationOpen, setNavigationOpen] = useState(false);
  const { pathname } = useLocation();
  const currentPage =
    navigationItems.find((item) =>
      item.to === '/' ? pathname === '/' : pathname.startsWith(item.to),
    )?.label ?? 'Page not found';
  const title = pathname.startsWith('/nodes/') ? 'Node Details' : currentPage;
  const primaryAction = pathname === '/' || pathname === '/nodes';

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      <a
        className="fixed top-3 left-3 z-50 -translate-y-[160%] rounded-sm bg-primary px-3 py-2 text-xs text-primary-foreground focus:translate-y-0"
        href="#main-content"
      >
        Skip to content
      </a>

      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
        <SidebarContent />
      </aside>

      <Sheet open={navigationOpen} onOpenChange={setNavigationOpen}>
        <SheetContent
          side="left"
          className="w-60 max-w-[85vw] bg-sidebar p-0 text-sidebar-foreground lg:hidden"
          showCloseButton
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>
              Move between Plumba dashboard sections.
            </SheetDescription>
          </SheetHeader>
          <SidebarContent onNavigate={() => setNavigationOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-border bg-background px-4 py-3 sm:px-7 lg:px-8">
          <div className="mx-auto grid max-w-[1440px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                type="button"
                className="lg:hidden"
                onClick={() => setNavigationOpen(true)}
                aria-label="Open navigation"
              >
                <List aria-hidden="true" />
              </Button>
              <div className="min-w-0">
                <p className="hidden text-[10px] leading-4 text-muted-foreground sm:block">
                  Workspace / {title}
                </p>
                <strong className="block truncate text-sm font-semibold leading-5">
                  {title}
                </strong>
              </div>
            </div>
            <div className="col-span-2 flex items-center justify-between gap-3 border-t border-border pt-3 sm:col-span-1 sm:justify-end sm:border-0 sm:pt-0">
              <span className="font-mono text-[10px] text-muted-foreground sm:hidden">
                Host
              </span>
              <HostContext />
              {primaryAction && (
                <Button
                  size="sm"
                  render={<Link to="/catalog" />}
                  nativeButton={false}
                >
                  <Plus data-icon="inline-start" aria-hidden="true" />
                  <span className="hidden sm:inline">Deploy node</span>
                  <span className="sm:hidden">Deploy</span>
                </Button>
              )}
            </div>
          </div>
        </header>

        <main
          id="main-content"
          className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 py-6 sm:px-7 sm:py-8 lg:px-8"
          tabIndex={-1}
        >
          <Alert>
            <Info aria-hidden="true" />
            <AlertTitle>Preview workspace</AlertTitle>
            <AlertDescription>
              Data is illustrative. Actions update this browser only; no server
              is connected.
            </AlertDescription>
          </Alert>
          <Suspense
            fallback={
              <div
                className="flex flex-col gap-4 py-4"
                role="status"
                aria-label="Loading page"
              >
                <Skeleton className="h-7 w-44" />
                <Skeleton className="h-4 w-72 max-w-full" />
                <Skeleton className="h-44 w-full" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
