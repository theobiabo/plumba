import {
  ArrowClockwise,
  GearSix,
  HardDrives,
  Plugs,
  ShieldCheck,
} from '@phosphor-icons/react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@plumba/ui/components/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@plumba/ui/components/alert-dialog';
import { Button } from '@plumba/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@plumba/ui/components/card';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@plumba/ui/components/field';
import { Input } from '@plumba/ui/components/input';
import {
  NativeSelect,
  NativeSelectOption,
} from '@plumba/ui/components/native-select';
import { useState, type FormEvent, type ReactNode } from 'react';
import { PageHeading } from '../../components/page-heading';
import { StatusBadge } from '../../components/status-badge';
import { useWorkspace } from '../../app/use-workspace';

const enrollmentSteps = [
  'Connect your management server.',
  'Install the agent on a machine you control.',
  'Approve the host and choose its storage.',
];

function SettingCardHeading({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid size-9 shrink-0 place-items-center border border-border bg-muted text-muted-foreground">
        {icon}
      </span>
      <CardTitle>{children}</CardTitle>
    </div>
  );
}

function validateServerAddress(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return 'Use an http:// or https:// address.';
    }
    if (url.username || url.password) {
      return 'Do not include credentials in the server address.';
    }
    return '';
  } catch {
    return 'Enter a complete server URL, such as http://localhost:4000.';
  }
}

export function SettingsPage() {
  const {
    serverAddress,
    ownerName,
    sessionTimeoutMinutes,
    saveServerAddress,
    savePreferences,
    resetPreview,
  } = useWorkspace();
  const [addressDraft, setAddressDraft] = useState(serverAddress);
  const [addressError, setAddressError] = useState('');
  const [nameDraft, setNameDraft] = useState(ownerName);
  const [timeoutDraft, setTimeoutDraft] = useState(sessionTimeoutMinutes);
  const [nameError, setNameError] = useState('');
  const [resetOpen, setResetOpen] = useState(false);

  function handleAddressSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const error = validateServerAddress(addressDraft.trim());
    setAddressError(error);
    if (!error) saveServerAddress(addressDraft);
  }

  function handlePreferencesSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (nameDraft.trim().length < 2) {
      setNameError('Use at least two characters for the display name.');
      return;
    }
    setNameError('');
    savePreferences(nameDraft, timeoutDraft);
  }

  function handleReset() {
    resetPreview();
    setAddressDraft('');
    setAddressError('');
    setNameDraft('Workspace owner');
    setTimeoutDraft(30);
    setNameError('');
    setResetOpen(false);
  }

  return (
    <>
      <PageHeading
        title="Settings"
        description="Connection details, owner preferences and host enrollment controls."
      />

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
        <div className="flex min-w-0 flex-col gap-4">
          <Card>
            <CardHeader>
              <SettingCardHeading icon={<Plugs size={17} aria-hidden="true" />}>
                Management server
              </SettingCardHeading>
              <CardDescription>
                The server coordinates enrolled hosts, deployments and
                telemetry.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border border-border bg-muted/30 p-4">
                <div>
                  <p className="text-xs font-semibold">Connection status</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    No live API is wired to this dashboard.
                  </p>
                </div>
                <StatusBadge status="disconnected" />
              </div>
              <form
                id="server-address-form"
                onSubmit={handleAddressSubmit}
                noValidate
              >
                <FieldGroup>
                  <Field data-invalid={Boolean(addressError)}>
                    <FieldLabel htmlFor="server-address">
                      Server address
                    </FieldLabel>
                    <Input
                      id="server-address"
                      type="url"
                      value={addressDraft}
                      onChange={(event) => {
                        setAddressDraft(event.target.value);
                        if (addressError) setAddressError('');
                      }}
                      placeholder="http://localhost:4000"
                      aria-invalid={Boolean(addressError)}
                      className="font-mono"
                    />
                    <FieldDescription>
                      Saved only in this interface preview. No request is sent
                      to the address.
                    </FieldDescription>
                    {addressError && <FieldError>{addressError}</FieldError>}
                  </Field>
                </FieldGroup>
              </form>
            </CardContent>
            <CardFooter className="justify-end">
              <Button form="server-address-form" type="submit" size="sm">
                Save address
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <SettingCardHeading
                icon={<GearSix size={17} aria-hidden="true" />}
              >
                Owner and session
              </SettingCardHeading>
              <CardDescription>
                Display preferences for this browser preview. Authentication is
                not connected.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                id="owner-settings-form"
                onSubmit={handlePreferencesSubmit}
                noValidate
              >
                <FieldGroup className="grid gap-4 sm:grid-cols-2">
                  <Field data-invalid={Boolean(nameError)}>
                    <FieldLabel htmlFor="owner-name">
                      Owner display name
                    </FieldLabel>
                    <Input
                      id="owner-name"
                      value={nameDraft}
                      onChange={(event) => {
                        setNameDraft(event.target.value);
                        if (nameError) setNameError('');
                      }}
                      aria-invalid={Boolean(nameError)}
                    />
                    {nameError && <FieldError>{nameError}</FieldError>}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="session-timeout">
                      Session timeout preference
                    </FieldLabel>
                    <NativeSelect
                      id="session-timeout"
                      value={timeoutDraft}
                      onChange={(event) =>
                        setTimeoutDraft(Number(event.target.value))
                      }
                      className="w-full"
                    >
                      <NativeSelectOption value={15}>
                        15 minutes
                      </NativeSelectOption>
                      <NativeSelectOption value={30}>
                        30 minutes
                      </NativeSelectOption>
                      <NativeSelectOption value={60}>
                        60 minutes
                      </NativeSelectOption>
                    </NativeSelect>
                    <FieldDescription>
                      Preview setting only; no active session is changed.
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </form>
            </CardContent>
            <CardFooter className="justify-end">
              <Button
                form="owner-settings-form"
                type="submit"
                variant="secondary"
                size="sm"
              >
                Save preferences
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-4">
          <Card>
            <CardHeader>
              <SettingCardHeading
                icon={<HardDrives size={17} aria-hidden="true" />}
              >
                Host enrollment
              </SettingCardHeading>
              <CardDescription>
                Bring a machine under management through the Plumba agent.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <ol className="flex flex-col gap-3 text-xs leading-5 text-muted-foreground">
                {enrollmentSteps.map((step, index) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="grid size-7 shrink-0 place-items-center border border-border bg-muted font-mono text-[10px] text-muted-foreground">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="pt-1">{step}</span>
                  </li>
                ))}
              </ol>
              <Button
                type="button"
                variant="outline"
                disabled
                className="self-start"
              >
                Generate enrollment token
              </Button>
              <p className="text-xs leading-5 text-muted-foreground">
                Token generation requires the Rust server and host enrollment
                API. No enrollment token is available in this preview.
              </p>
            </CardContent>
          </Card>

          <Alert>
            <ShieldCheck aria-hidden="true" />
            <AlertTitle>Private by default</AlertTitle>
            <AlertDescription>
              Plumba is designed to keep host data and RPC access inside your
              own infrastructure. Public exposure should require an explicit
              configuration step.
            </AlertDescription>
          </Alert>

          <Card size="sm">
            <CardHeader>
              <CardTitle>Preview controls</CardTitle>
              <CardDescription>
                Restore the sample hosts, nodes, activity and local settings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setResetOpen(true)}
              >
                <ArrowClockwise data-icon="inline-start" aria-hidden="true" />
                Reset sample workspace
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset the sample workspace?</AlertDialogTitle>
            <AlertDialogDescription>
              This clears preview changes in this tab and restores the starting
              sample data. It does not touch a real host or server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset}>
              Reset preview
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
