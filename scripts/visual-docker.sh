#!/bin/sh
# Runs the visual suite in the Playwright Linux image that CI uses, so fonts and rendering match.
# Storybook is built and served from the host; only Playwright runs in the container.
#   sh scripts/visual-docker.sh                      compare against baselines
#   sh scripts/visual-docker.sh --update-snapshots   regenerate baselines
set -e
pnpm build && pnpm build-storybook
# A plain static server: vite preview rejects the host.docker.internal hostname.
python3 -m http.server 6008 --directory apps/docs/storybook-static >/dev/null 2>&1 &
server=$!
trap 'kill $server' EXIT
sleep 2
docker run --rm --ipc=host -e ARGS="$*" -v "$PWD":/repo mcr.microsoft.com/playwright:v1.64.0-noble sh -c '
  set -e
  mkdir /w && cp -r /repo/tests /repo/playwright.config.ts /w && cd /w
  npm init -y >/dev/null && npm i --silent @playwright/test@1.64.0 @axe-core/playwright
  VISUAL_BASE_URL=http://host.docker.internal:6008 npx playwright test --project=visual $ARGS
  case "$ARGS" in *--update-snapshots*) rm -rf /repo/tests/__screenshots__ && cp -r tests/__screenshots__ /repo/tests/ ;; esac'
