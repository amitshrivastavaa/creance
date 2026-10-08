# Changesets

Every pull request that changes a published package (`creance`, `creance-tokens`) adds a changeset:

```sh
pnpm changeset
```

Pick the packages, the bump (patch, minor or major) and write one or two sentences for the changelog, in the voice of someone upgrading. Deprecations and breaking changes link to `docs/MIGRATIONS.md`.

Releasing (maintainers): `pnpm version-packages` applies the changesets, bumps versions and writes the changelogs; review and commit that, then `pnpm release` builds and publishes.
