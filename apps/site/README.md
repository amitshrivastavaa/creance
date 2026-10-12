# Creance site

The project site: an overview page, and docs with getting-started guides and all 109 components.
Each component runs from the built `@creance-ui/react` package, with example code that can be edited in place.

```sh
pnpm build        # at the repo root: the site consumes the built packages
pnpm site         # dev server
pnpm test:site    # build it and run the browser tests
```

## How it is put together

- `index.html` holds the overview's markup. `src/page.ts` switches between the overview and the
  docs, and runs the demo in the hero.
- `src/main.tsx` is the docs app: sidebar, live examples, props and keyboard tables, search.
- `src/examples.ts` and `src/more.ts` hold the example code. `src/categories.json` sets the sidebar order.
- `src/guides.tsx` holds the guide pages.
- `src/jsx.ts` reads the edited example code. It parses a subset of JSX and evaluates it against a
  fixed scope, so nothing is passed to `eval`. Operators and statements are not supported.
- `examples/` holds sample apps built only from the kit, each its own page under `/examples/`.
  `examples/gallery.tsx` lists them on the home page's Examples view (`/#examples`); `/examples/` forwards there. `operations/` is a whole product: its
  `main.tsx` routes between screens by hash, `shell.tsx` is the sidebar and header they share, `data.ts`
  is the made-up data, and each screen is one file in `operations/screens/`. `assistant/`, `review/`,
  `sign-in/` and `mobile/` are one file each. `shared.css` and `SampleNote.tsx` are what they share.
- `public/examples/thumbs/` holds the gallery's screenshots, light and dark. `pnpm --filter site thumbs`
  takes them again from the built site and demo, so they match the apps; run it after changing one.
- `scripts/extract-props.mjs` reads the library's TypeScript types and writes `src/props.json`,
  which is generated on every dev, build and typecheck run and is not committed.

## Search engines and link previews

`index.html` carries the title, description, canonical address, Open Graph tags and structured data.
`public/` holds the favicons, `robots.txt`, `sitemap.xml` and `og.png`, the card shown when a link is
shared. `pnpm --filter site images` redraws the PNG and ICO files from `scripts/brand-images.mjs`.

The site's address, `https://creance.pages.dev/`, is written in `index.html`, `robots.txt`,
`sitemap.xml` and `scripts/build-llms.mjs`. Change all four if it moves.

Guides and components are views of one page, switched by the part of the address after `#`, so a
search engine sees a single page. Giving each its own address would need a build step that writes
one HTML file per page.

## Docs for coding agents

After `vite build`, `scripts/build-llms.mjs` writes the docs as markdown into `dist/`: `llms.txt`, an
index in the [llms.txt](https://llmstxt.org) format; `docs/<Name>.md`, one file per guide and
component with its example code, props and keyboard tables; and `llms-full.txt`, all of them in one
file. It reads the same sources as the site, so the two cannot drift apart.

## A single-page build

`pnpm --filter site build:artifact` writes `artifact/creance-ui-kit.html` and
`artifact/creance-playground.js`: the same site as one page with its styles inlined and one script,
for places that host a page as a fragment rather than a full document.
