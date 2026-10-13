# Creance as a shadcn registry

Date: 2026-10-13. Status: approved and built. Sections marked "found while building" record what the smoke test changed.

## Why

Most React developers now add components with `npx shadcn add`, and own the code it copies in. A registry puts
Creance in that flow: a developer who wants `ApprovalPrompt` runs one command and gets its source, its CSS and
everything it depends on, in their own project, to read and change. Once listed in shadcn's public registry
index, it is also a place people find Creance.

Success: in a fresh Next.js project set up with shadcn, `npx shadcn add https://creance.pages.dev/r/approval-prompt.json`
installs ApprovalPrompt and the components it uses; after importing one CSS file, it builds, typechecks, renders
as it does in Creance, and passes axe, in light and in dark through the `.dark` class.

## What a spike established (2026-10-13, throwaway, shadcn 4.21.4, Next.js 16.4.0, Tailwind 4)

- A `registry:file` with a `target` installs a component's `.css` next to its `.tsx`; the `.tsx` keeps
  `import './Button.css'`. Targets may use `@components/` and `@lib/`, which resolve to the project's aliases.
- `registryDependencies` given as URLs are fetched and installed first. An item's `docs` text is printed after install.
- The project built with Tailwind's preflight present, and the button rendered as in Creance.
- Re-adding an item asks before replacing a file the developer edited (default no, even with `-y`); only
  `--overwrite` replaces it. So editing `tokens.css` to retheme is safe.
- `shadcn build` must run with the registry's folder as the working directory.

## Constraints

- Generated from `packages/react/src` on every site build, so the registry cannot drift from the library.
  Nothing generated is committed.
- No new runtime dependency for the library. `shadcn` is added as a pinned devDependency of `apps/site`, to run `shadcn build`.
- The registry follows `main`, so it can be ahead of the latest npm release. The docs say so.
- Honest docs: the components look like Creance (frosted glass), not like the developer's shadcn theme.

## Items

| Item | Type | Files (installed to) |
|---|---|---|
| one per component folder, 109 in all, named in kebab case (`ApprovalPrompt` → `approval-prompt`) | `registry:ui` | every `.tsx`, `.ts` and `.css` in the folder except `index.ts`, tests and stories → `@components/creance/<item>/<File>` |
| `creance-base` | `registry:lib` | `cx.ts` (which imports `base.css`), `base.css`, `icons.tsx`, `LiveRegion.tsx`, `VisuallyHidden.tsx`, `formatDuration.ts`, `deprecate.ts` → `@lib/creance/`; `tokens.css` → `@lib/creance/tokens.css` |
| `creance-chart` | `registry:lib` | `chart.tsx`, `chart.css` → `@lib/creance/` (only the chart components use it) |
| `agent-run` | `registry:lib` | `events.ts` → `@lib/creance/events.ts`; `run/reduceRun.ts`, `run/selectors.ts`, `run/useAgentRun.ts`, `run/index.ts` → `@lib/creance/run/` (the event model, for apps that drive components from an agent, like the AI SDK example) |

Every item depends on `creance-base`. Its `docs` text tells the developer to import `@/lib/creance/tokens.css`
once in their root layout; `base.css` loads itself through `cx.ts`.

Each item carries its `title` and `description` from the component's doc comment, and `categories` from its
layer and the docs' groups (for example `agent`, `forms`).

## Rewriting imports

The generator rewrites every relative import that leaves a component's folder:

| In the library | In the registry file |
|---|---|
| `../../internal/<module>` | `@/lib/creance/<module>` |
| `../../<layer>/<Name>/<File>`, `../<Name>/<File>` | `@/components/creance/<item>/<File>` |
| `../<Name>` (a folder's index) | `@/components/creance/<item>/<Name>` |
| `import '../Dialog/Dialog.css'` (shared CSS, 7 places) | `import '@/components/creance/dialog/Dialog.css'` |
| `./molecules/RiskLabel` and other component imports in `events.ts` and `run/` | `@/components/creance/<item>/<File>`; imports between `events.ts` and `run/` stay relative, since the layout is kept |

Each rewritten component import adds that component's item to `registryDependencies`. The shadcn CLI then maps
`@/components` and `@/lib` to the project's own aliases. The smoke test uses a project with non-default aliases to prove it.

`registryDependencies` are full URLs (`<base>/<item>.json`, base from `REGISTRY_URL`, default
`https://creance.pages.dev/r`), so they work before and after index listing.

npm imports become `dependencies`, pinned to the versions in `packages/react/package.json` (the ten Radix packages).
React is assumed present.

## Dark mode in shadcn projects

shadcn projects switch theme with the `.dark` class on `<html>` (next-themes sets it, and follows the system when
asked); their own CSS ignores the system setting. Creance's tokens followed only `data-theme` and the system setting.

- The tokens build (`packages/tokens/build.mjs`) also accepts the classes: `:root:where([data-theme="dark"], .dark)`
  for dark, and `:root:where(:not([data-theme="light"], .light))` inside `prefers-color-scheme: dark`. This ships in
  `@creance-ui/tokens` (a minor changeset), so npm users on next-themes get it too.
- The registry's copy of `tokens.css` drops the `prefers-color-scheme` block, so Creance follows the app like the
  rest of a shadcn project. Found by the smoke test: on a dark system, a plain shadcn app stays light, and Creance
  turning dark on its white page failed axe contrast. The generator fails loudly if that block's shape changes.

## Found while building: no clock reads while rendering

The smoke test's `next build` failed: `create-next-app` now turns on `cacheComponents`, and Next.js 16 then refuses
`Date.now()` or `new Date()` during prerendering. StatusBadge, RelativeTimeCard, NeedsYouInbox and Calendar read the
clock while rendering, so this affected npm users too. They now read it after mount through `internal/useNow.ts`
(a patch changeset), and `apps/next` builds with `cacheComponents` on, so all 109 components are checked under it.

## Hosting

- `apps/site/scripts/build-registry.mjs` writes `apps/site/registry/registry.json` and the files it lists, then runs
  `shadcn build` from that folder into `apps/site/public/r`. Both folders are gitignored.
- The site's `build` runs it before Vite, so `/r/<item>.json` and `/r/registry.json` deploy with the site.
- Index listing (`@creance`): a pull request to `shadcn-ui/ui` adding Creance to `apps/v4/registry/directory.json`,
  drafted here and opened by the maintainer after the registry is live.

## Docs

- The Installation guide gets a shadcn section: the command, the one CSS import, what gets installed where, the
  `.dark` support, and that the registry follows `main`.
- Each component's docs page shows its `npx shadcn add` command next to the npm import.
- The generated `/docs/<Component>.md` files for llms.txt include the command.
- The README gets a short "With shadcn" section.

## Testing

- `apps/site/scripts/build-registry.test.mjs` (`node --test`, no new dependency): 109 component items plus the three
  libs; no file content still has a relative import that leaves its item; every `registryDependencies` URL names an
  item that exists; every npm import is declared; `tokens.css` contains the `.dark` selector.
- `scripts/registry-smoke.mjs`, run in CI: builds the registry with `REGISTRY_URL` pointing at a local server,
  copies a checked-in fixture (`tests/registry-fixture/`: a minimal Next.js + Tailwind + shadcn project whose aliases
  are `~/…`, not `@/…`) to a temporary folder, installs it, runs `shadcn add` for `approval-prompt`, `chat`,
  `run-timeline` and `agent-run`, then `tsc --noEmit` and `next build`.
- `tests/registry.spec.ts` (Playwright, run by the smoke script against `next start`): the fixture's page shows the
  three components and they work; axe passes in light (also on a dark system, where the app stays light) and with
  the `.dark` class; `data-theme="dark"` works too.
- A tokens unit test for the new selectors.

## Out of scope

- Following the developer's shadcn theme (`--primary`, `--background`) instead of Creance's look.
- Tailwind versions of the components.
- Versioned registries (one per npm release).
