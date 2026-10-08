# Migrations

How to move between versions of `creance` when an API changes. Each entry says what changed, why, what still works, and how to migrate.

## Deprecation policy

- A deprecated API keeps working for at least one minor release and until the next major.
- It is marked `@deprecated` in the types, so editors strike it through, and it logs a one-time `console.warn` outside production builds.
- The changelog entry links here. Where a rename can be done mechanically, a codemod ships in the package.
- Removal happens only in a major release and is listed under "Breaking changes" in the changelog.

## 0.2.0: `ApprovalPrompt` `onApprove` → `onAllow`

**What changed.** The callback for the Allow buttons is now `onAllow`. `onApprove` is deprecated and will be removed in **1.0**.

**Why.** The buttons say **Allow once** and **Always allow**, the outcome says "Allowed once", and the event model says `allow-once`. A prop called `onApprove` was the only place the word "approve" survived, which made people search the docs for the wrong term.

**What still works.** `onApprove` behaves exactly as before. In development it logs once:

```
[creance] ApprovalPrompt: `onApprove` is deprecated and will be removed in 1.0. Rename it to `onAllow`. See docs/MIGRATIONS.md.
```

If you pass both, `onAllow` is used and `onApprove` is ignored. The signature is unchanged: both receive `'once' | 'always'`.

**Migrate.**

```diff
  <ApprovalPrompt
    action="npm install zod@3"
    risk="medium"
    reason="…"
-   onApprove={(scope) => allow(scope)}
+   onAllow={(scope) => allow(scope)}
    onDeny={deny}
  />
```

Or run the codemod, which renames the prop on `<ApprovalPrompt>` elements only (not on other components, strings or comments). It uses your project's `typescript` package to parse the files:

```sh
npx creance-codemod-on-allow src --dry   # list what would change
npx creance-codemod-on-allow src         # rewrite in place
```

Props spread from an object (`<ApprovalPrompt {...props} />`) are not rewritten; rename the key in that object yourself. The development warning will point you to anything left.
