# Plumba site

The public Plumba homepage, built with Astro and TypeScript. Production output is static HTML and CSS.

## Development

Use the Node version in the repository's `.nvmrc`, then run these commands from the repository root:

```sh
pnpm install --frozen-lockfile
pnpm dev:site
```

The site uses port 4321 by default and prints its actual URL when that port is occupied. Astro starts the server in the background, as required by this app's `AGENTS.md`.

```sh
pnpm --filter site astro dev status
pnpm --filter site astro dev logs
pnpm --filter site astro dev stop
```

## Checks and build

```sh
pnpm --filter site check
pnpm --filter site lint
pnpm --filter site format:check
pnpm --filter site build
```

The build runs Astro's type checker before generating `apps/_site/dist`. Root Turborepo commands also include the site in build, check, and lint tasks.

Set `SITE_URL` to the public origin when building for deployment. Astro uses it to generate canonical links and absolute social preview URLs.

The site imports Departure Mono v1.500 and the shared color tokens from `@plumba/ui`. The font comes from the [official release](https://github.com/rektdeckard/departure-mono/releases/tag/v1.500), and its SIL Open Font License is included at `public/fonts/OFL.txt`.

## Structure

```text
src/pages/        Page routes and section composition
src/components/   Reusable Astro components
src/layouts/      Document shell and page metadata
src/data/         Shared project details
src/styles/       Shared design tokens and responsive styles
public/           Public assets copied into the static build
```

Keep content and section composition in page files. Use typed component props for repeated UI and native browser scripts for the interactions that need them. Astro components render to HTML without a client framework runtime.

## Artwork

The built-in image generation tool produced two original monochrome dither images. The site serves optimized lossless WebP assets:

- `public/images/network-dither.webp`: a connected network globe on a dark background, used in the social preview.
- `public/images/terrain-dither.webp`: rocky terrain with a dark central field, used behind the page content.

The files are 512 × 512 and 1024 × 512 pixels respectively. The social preview is composed from the same network artwork. Generation prompts are recorded in [ARTWORK.md](./ARTWORK.md).
