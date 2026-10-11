---
'@creance-ui/react': patch
---

AppShell's "Skip to content" link no longer shows above the shell when the shell is not at the top of the page. It was moved out of view rather than hidden, so it was only off-screen in a full-height app. It is now clipped until it has focus.
