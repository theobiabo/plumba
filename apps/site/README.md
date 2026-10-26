# Plumba site

The public Plumba homepage, built with Astro and TypeScript. Production output is static HTML and CSS.

## Development

Use the Node version in the repository's `.nvmrc`, then run these commands from the repository root:

```sh
pnpm install --frozen-lockfile
pnpm dev:site
```

The site uses port 4321 by default and prints its actual URL when that port is occupied. Astro starts the server in the background.

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

The build runs Astro's type checker before generating `apps/site/dist`. Root Turborepo commands also include the site in build, check, and lint tasks.

Set `SITE_URL` to the public origin when building for deployment. Astro uses it to generate canonical links and absolute social preview URLs.

The site imports `@plumba/ui/globals.css` for Tailwind v4, shared colors, and Departure Mono v1.500. The font comes from the [official release](https://github.com/rektdeckard/departure-mono/releases/tag/v1.500), and its SIL Open Font License is included at `public/fonts/OFL.txt`.

Astro supports React components from the shared workspace package. Import them through the package export, such as `@plumba/ui/components/button`. The homepage's `repository-button.tsx` demonstrates a shared component rendered into static HTML. Add a `client:*` directive in an Astro page only when the component needs browser interaction.

## Structure

```text
src/pages/        Page routes and section composition
src/components/   Reusable Astro and React components
src/layouts/      Document shell and page metadata
src/data/         Shared project details
src/styles/       Shared Tailwind entrypoint and document defaults
public/           Public assets copied into the static build
```

Keep content and section composition in page files. Use typed component props for repeated UI. Astro and React components render to HTML without client JavaScript unless an interactive component opts into hydration.

## Artwork

The site includes two original monochrome dither images as optimized lossless WebP assets:

- `public/images/network-dither.webp`: a connected network globe used in the workflow section and social preview.
- `public/images/terrain-dither.webp`: rocky terrain behind the homepage hero.
- `public/images/dashboard-preview.jpg`: desktop dashboard screenshot used in the homepage preview.
- `public/images/dashboard-preview-mobile.jpg`: mobile dashboard screenshot used on narrow screens.

The dither images are 512 × 512 and 1024 × 512 pixels respectively. Refresh both dashboard screenshots when the interface changes materially.
