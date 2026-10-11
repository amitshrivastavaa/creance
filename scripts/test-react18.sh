#!/bin/sh
# Runs the unit tests on React 18, the oldest version the package supports, then puts the
# workspace back on the React it had. CI runs this in its own job.
set -e
tmp=$(mktemp -d)
cp packages/react/package.json "$tmp/package.json"
cp pnpm-lock.yaml "$tmp/pnpm-lock.yaml"
restore() {
  cp "$tmp/package.json" packages/react/package.json
  cp "$tmp/pnpm-lock.yaml" pnpm-lock.yaml
  pnpm install --frozen-lockfile >/dev/null
  rm -rf "$tmp"
}
trap restore EXIT
pnpm --filter @creance-ui/react add -D react@^18.3.1 react-dom@^18.3.1 >/dev/null
# The test setup fails the run if it is not really on React 18.
REACT=18 pnpm --filter @creance-ui/react test
