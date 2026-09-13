# Rajeev Chandar — Portfolio

A responsive scrollytelling portfolio built with React 19, TypeScript, Vinext/Vite and Cloudflare Workers. Features a pointer-reactive canvas particle field, four sticky project chapters, accessible project dialogs, motion controls, and a downloadable résumé.

## Run

Requires Node.js 22.13 or newer.

```sh
npm run install:ci
npm run dev
```

Open http://localhost:5173.

## Validate and build

```sh
npx tsc --noEmit
npm run lint
npm run build
npm start
```

The production Worker is emitted to `dist/server/index.js`, with client assets in `dist/client`. Sites publishing uses the existing project in `.openai/hosting.json`.

On Windows, if the system npm shim cannot locate npm, invoke the installed npm entrypoint directly, for example `node "C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js" run dev`.

## Content

Edit project content in `app/page.tsx`, visual tokens and responsive rules in `app/globals.css`, and metadata in `app/layout.tsx`. The downloadable résumé is `public/Rajeev-Chandar-Resume.pdf`.

Content reflects the supplied résumé and the local Solenne README. Solenne is explicitly described as a non-clinical prototype; DoChain uses the Polygon test network. No invented project URLs or performance metrics are included.

## Accessibility and motion

Native anchor navigation, visible focus states, a skip link, keyboard-accessible Radix dialogs, operating-system reduced-motion support and a manual animation pause control are included. Canvas animation is pixel-density capped and drawing is suspended outside the viewport. Core content is server rendered and stays readable if JavaScript is unavailable.
