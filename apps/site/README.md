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
- `examples/` is a second page, served at `/examples/`: a sample agent operations app built only from
  the kit. `examples/main.tsx` routes between screens by hash, `examples/shell.tsx` is the sidebar and
  header they share, `examples/data.ts` is the made-up data, and each screen is one file in
  `examples/screens/`, linked from the page as its source.
- `scripts/extract-props.mjs` reads the library's TypeScript types and writes `src/props.json`,
  which is generated on every dev, build and typecheck run and is not committed.

## Search engines and link previews

`index.html` carries the title, description, canonical address, Open Graph tags and structured data.
`public/` holds the favicons, `robots.txt`, `sitemap.xml` and `og.png`, the card shown when a link is
shared. `pnpm --filter site images` redraws the PNG and ICO files from `scripts/brand-images.mjs`.

The site's address, `https://creance.pages.dev/`, is written in `index.html`, `robots.txt` and
`sitemap.xml`. Change all three if it moves.

Guides and components are views of one page, switched by the part of the address after `#`, so a
search engine sees a single page. Giving each its own address would need a build step that writes
one HTML file per page.

## A single-page build

`pnpm --filter site build:artifact` writes `artifact/creance-ui-kit.html` and
`artifact/creance-playground.js`: the same site as one page with its styles inlined and one script,
for places that host a page as a fragment rather than a full document.
