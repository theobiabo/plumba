# Plumba

Open source, self-hosted blockchain node management with a Rust server and agent, a React dashboard, and an Astro homepage.

## Requirements

- Node.js 24.19.0, as specified in `.nvmrc`
- pnpm 11.9.0, as specified in `package.json`
- Rust 1.96.1 or newer with Cargo, Clippy, and rustfmt

## Development

```sh
pnpm install --frozen-lockfile
pnpm dev
```

The dashboard runs at http://127.0.0.1:5173. It includes overview, hosts, nodes, and settings routes with explicit disconnected states. The Rust crates are scaffolds; host enrollment, node deployment, and monitoring require backend implementation.

Start the Astro homepage separately:

```sh
pnpm dev:site
pnpm --filter site astro dev status
pnpm --filter site astro dev logs
pnpm --filter site astro dev stop
```

The homepage uses port 4321 by default and prints its actual URL when that port is occupied. Astro runs it in the background and records the server state in `apps/_site/.astro`.

## Structure

```text
apps/dashboard/   React, TypeScript, and Vite dashboard
apps/_site/       Static Astro homepage
crates/server/    Rust management server
crates/agent/     Rust host agent
crates/core/      Shared Rust domain types
crates/chains/    Blockchain client integrations
```

## Commands

| Command             | Purpose                                                                       |
| ------------------- | ----------------------------------------------------------------------------- |
| `pnpm dev`          | Start the dashboard through Turborepo                                         |
| `pnpm dev:site`     | Start the Astro homepage in the background through Turborepo                  |
| `pnpm build`        | Build the homepage, dashboard, and Rust binaries                              |
| `pnpm check`        | Check Astro, TypeScript, and the entire Rust workspace                        |
| `pnpm lint`         | Run ESLint for both web apps and Clippy with warnings treated as errors       |
| `pnpm test`         | Run the Rust workspace tests                                                  |
| `pnpm format`       | Format JavaScript, TypeScript, styles, configuration, documentation, and Rust |
| `pnpm format:check` | Check formatting                                                              |

## Turborepo and Rust

The root `turbo.json` enables native Cargo workspace discovery. Rust crates use `Cargo.toml` manifests directly. The workspace identity is `plumba-rust`; it provides checks and tests across all Rust crates.

```sh
pnpm exec turbo run build --filter=plumba-server
pnpm exec turbo run build --filter=plumba-agent -- --release
pnpm exec turbo run check --filter=plumba-core
pnpm exec turbo run lint --filter=plumba-rust
```

Cargo integration and custom native task commands are experimental in Turborepo 2.11.10. The version is pinned, and both package-manager lockfiles are included in the repository. The configuration follows the [official Rust integration guide](https://turborepo.dev/docs/guides/tools/rust).

The dashboard build is written to `apps/dashboard/dist`. Deployments serving it must fall back to `index.html` for dashboard routes. Rust builds retain Turborepo's native output detection rather than caching the entire Cargo target directory.

The Astro homepage is built to `apps/_site/dist`. Its build runs `astro check` before generating static pages.
