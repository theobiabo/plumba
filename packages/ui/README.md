# Plumba UI

Shared design tokens, Departure Mono, and shadcn React components for Plumba apps.

## Use in React apps

Add `@plumba/ui` as a workspace dependency and import the stylesheet once at the app entry point:

```ts
import '@plumba/ui/globals.css';
```

Import components from their package paths:

```tsx
import { Button } from '@plumba/ui/components/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@plumba/ui/components/card';
```

The stylesheet includes Tailwind v4, component styles, and the shared theme. Vite apps need `@tailwindcss/vite` in their plugin list.

## Use in Astro

Astro pages that do not render React components can import the font and tokens alone:

```css
@import '@plumba/ui/theme.css';
```

## Tokens

The default theme is dark. It uses Departure Mono v1.500, a `#111111` canvas, `#F2F2F0` text, and Hoplite's `#FF3616` brand orange for primary actions and focus. Primary controls use `#111111` text on orange. Components use semantic CSS variables such as `--primary`, `--background`, and `--muted-foreground`; Tailwind maps them to utilities such as `bg-primary` and `text-muted-foreground`.

The font is self-hosted from the [official Departure Mono release](https://github.com/rektdeckard/departure-mono/releases/tag/v1.500). Its SIL Open Font License is in [OFL.txt](./OFL.txt).

## Add components

From the repository root, add official components through a configured React app:

```sh
pnpm dlx shadcn@latest add button -c apps/dashboard
```

The dashboard and this package both use the `base-lyra` style, Phosphor icons, and `neutral` base color in `components.json`. The CLI places reusable primitives here and app-specific compositions in the app.
