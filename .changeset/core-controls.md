---
"creance": minor
---

Core controls. Atoms: `Input`, `Textarea`, `Select`, `Checkbox`, `Radio`, `Switch`, `Separator`, `Skeleton`, all native elements styled as glass. Molecules: `Field` (label, hint and error wired to any control), `RadioGroup`, `Tabs`, `Menu`, `Dialog`, `Toast` with `toast()` and `<Toaster />`, `Alert` and `Card`. Tabs, Menu, Dialog and Toast are built on Radix.

The package now ships one module per source file, so bundlers drop components an app does not import. Importing only `ApprovalPrompt` costs 1.87 kB of Creance code, minified and brotlied.

Fix: under `prefers-reduced-motion`, `FleetSky` drew once and could be left blank after its first resize; it also ignored agent status changes and theme switches. It now redraws on resize, on theme change and when agents change.
