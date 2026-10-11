---
'@creance-ui/react': minor
---

App shell. Molecules: `Navbar` (a glass pill or flush bar; on a narrow bar the links move into a menu), `Sidebar` (grouped links with icons and counts, collapsing to icons that keep their names), `Steps` (horizontal or vertical, with done, current, upcoming and error states that are also spoken) and `Footer` (full, or one line). Template: `AppShell`, which arranges a sidebar, header, content and optional aside, starts with a skip link, and moves the sidebar into a sheet when it is narrow.

All five respond to the width they are given, not the window, using container queries.
