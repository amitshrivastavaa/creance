---
'@creance-ui/react': minor
---

Conversation. Seven molecules for talking with an agent: `Message` (yours in a tile on the right, the agent's as plain text under its name, with pending and streaming states), `MessageList` (follows new messages until you scroll up, then offers "Jump to latest"), `PromptInput` (Enter sends, Shift+Enter starts a new line, Send becomes Stop while the agent works, files attach as chips), `Reasoning` (the thinking, folded behind how long it took), `Sources` with `Citation` markers, `Suggestions` and `ModelPicker`.

`Message` takes whatever you render, so markdown is yours to parse. Existing components such as `ApprovalPrompt` and `ToolCallHeader` can sit inside a conversation.
