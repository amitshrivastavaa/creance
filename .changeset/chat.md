---
'@creance-ui/react': minor
---

`Chat`, an organism that is a whole conversation in one component. Give it a list of messages and an `onSend`; it renders each turn with its reasoning and sources, starting suggestions, and the prompt input, follows new messages, turns Send into Stop while the agent works, and announces each finished reply once. Anything passed as children, such as an `ApprovalPrompt`, appears after the last message.
