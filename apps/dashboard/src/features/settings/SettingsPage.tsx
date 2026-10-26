import { Plugs } from '@phosphor-icons/react';
import { PageHeading } from '../../components/PageHeading';

export function SettingsPage() {
  return (
    <>
      <PageHeading
        title="Settings"
        description="Your workspace and its connection to your infrastructure."
      />
      <section
        className="settings-section"
        aria-labelledby="server-settings-title"
      >
        <div className="settings-section-heading">
          <span className="settings-icon" aria-hidden="true">
            <Plugs size={22} />
          </span>
          <div>
            <h2 id="server-settings-title">Server connection</h2>
            <p>The server coordinates your hosts and node deployments.</p>
          </div>
        </div>
        <dl className="status-list">
          <div>
            <dt>Connection</dt>
            <dd>Not configured</dd>
          </div>
          <div>
            <dt>Server address</dt>
            <dd>Not set</dd>
          </div>
        </dl>
        <p className="status-explanation">
          This dashboard has no server integration configured yet. Enrollment,
          deployments, and live telemetry will become available when the Rust
          server is connected.
        </p>
      </section>
      <section
        className="context-note"
        aria-labelledby="deployment-settings-title"
      >
        <h2 id="deployment-settings-title">Your deployment</h2>
        <p>
          Plumba is designed for self-hosting. The dashboard, server, and
          hardware agents are separate parts of the same workspace.
        </p>
      </section>
    </>
  );
}
