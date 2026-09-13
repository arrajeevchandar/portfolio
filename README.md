# A R Rajeev Chandar — Portfolio

A responsive scrollytelling portfolio built with React 19, TypeScript, Vinext/Vite, GSAP, Three.js and Cloudflare Workers. A continuous geometry morph turns the opening sculpture into a connected system ring. Four interactive project chapters, engineering dialogs, motion controls, and a downloadable résumé follow.

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

Edit project content in `components/portfolio/content.ts`, interactive concepts in `components/portfolio/demos.tsx`, the Three.js scene in `components/portfolio/world.tsx`, scroll choreography in `app/page.tsx`, responsive rules in `app/globals.css`, and metadata in `app/layout.tsx`. The downloadable résumé is `public/Rajeev-Chandar-Resume.pdf`.

Content reflects the supplied résumé and the local Solenne README. Solenne is explicitly described as a non-clinical prototype; DoChain uses the Polygon test network. No invented project URLs or performance metrics are included.

## Accessibility and motion

Native anchor navigation, visible focus states, a skip link, keyboard-accessible Radix dialogs, operating-system reduced-motion support and a manual animation pause control are included. Canvas pixel density is capped and drawing is suspended when the document is hidden. Core content is server rendered. The WebGL scene has a fallback and disposes its GPU resources on unmount.
