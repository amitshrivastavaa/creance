# Creance site

The project site: an overview page, and docs with getting-started guides and all 90 components.
Each component runs from the built `creance` package, with example code that can be edited in place.

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
- `scripts/extract-props.mjs` reads the library's TypeScript types and writes `src/props.json`,
  which is generated on every dev, build and typecheck run and is not committed.

## A single-page build

`pnpm --filter site build:artifact` writes `artifact/creance-ui-kit.html` and
`artifact/creance-playground.js`: the same site as one page with its styles inlined and one script,
for places that host a page as a fragment rather than a full document.
