// Keyboard behaviour per component: only what the component (or the Radix part it wraps) really does.
type Keys = [keys: string, does: string][];

const menu: Keys = [
  ['Enter, Space or ↓', 'Open the menu from its button'],
  ['↑ ↓', 'Move between items'],
  ['Type a letter', 'Jump to the item that starts with it'],
  ['Enter', 'Choose the item'],
  ['Esc', 'Close and return focus to the button'],
];
const modal: Keys = [
  ['Tab', 'Moves between controls and stays inside'],
  ['Esc', 'Close and return focus to where it was'],
];
const hover: Keys = [
  ['Tab', 'Focusing the trigger shows it, the same as hovering'],
  ['Esc', 'Hide it'],
];
const radios: Keys = [
  ['↑ ↓ ← →', 'Move to another option and select it'],
  ['Tab', 'Leave the group'],
];

export const keyboard: Record<string, { keys: Keys; note?: string }> = {
  ApprovalPrompt: {
    keys: [['A', 'Allow once'], ['Shift + A', 'Always allow, when that is offered'], ['D', 'Deny']],
    note: 'These work only while focus is inside the prompt, and never with Ctrl, Alt or ⌘, so they cannot take over page shortcuts.',
  },
  DiffReview: {
    keys: [['J', 'Next hunk'], ['K', 'Previous hunk'], ['Y', 'Accept the focused hunk'], ['N', 'Reject the focused hunk']],
    note: 'These work only while focus is inside the review.',
  },
  PlanEditor: {
    keys: [['Alt + ↑', 'Move the focused step up'], ['Alt + ↓', 'Move the focused step down'], ['Enter or Space', 'Edit the focused step'], ['Enter', 'Save the edit'], ['Esc', 'Cancel the edit']],
    note: 'Every move is announced to screen readers.',
  },
  KillSwitch: { keys: [['Hold Space or Enter', 'Stops the agent once held for the full time'], ['Release early', 'Nothing happens']] },
  QuestionCard: { keys: radios },
  CheckpointRewind: { keys: radios },
  RadioGroup: { keys: radios },
  Choicebox: { keys: [['↑ ↓ ← →', 'In radio mode, move to another card and select it'], ['Space', 'In checkbox mode, toggle the focused card']] },
  ThemeSwitcher: { keys: radios },
  Checkbox: { keys: [['Space', 'Toggle']] },
  Switch: { keys: [['Space', 'Toggle']] },
  Toggle: { keys: [['Space or Enter', 'Toggle']] },
  Combobox: {
    keys: [['↓ ↑', 'Open the list and move through it'], ['Home, End', 'First or last option'], ['Enter', 'Pick the highlighted option'], ['Esc', 'Close and restore the chosen value']],
    note: 'Focus stays in the field the whole time; the highlighted option is announced.',
  },
  MultiSelect: {
    keys: [['↓ ↑', 'Open the list and move through it'], ['Enter', 'Add or remove the highlighted option; the list stays open'], ['Backspace', 'In an empty field, remove the last chip'], ['Esc', 'Close the list']],
  },
  Calendar: {
    keys: [['← →', 'Previous or next day'], ['↑ ↓', 'Same day in the previous or next week'], ['Home, End', 'Start or end of the week'], ['Page Up, Page Down', 'Previous or next month'], ['Shift + Page Up, Page Down', 'Previous or next year'], ['Enter or Space', 'Pick the day'], ['Esc', 'Cancel a range that is half picked']],
  },
  Slider: { keys: [['← → ↑ ↓', 'One step'], ['Page Up, Page Down', 'A larger step'], ['Home, End', 'Minimum or maximum']] },
  ToggleGroup: { keys: [['← →', 'Move between items'], ['Home, End', 'First or last item'], ['Space or Enter', 'Toggle the item']] },
  PromptInput: { keys: [['Enter', 'Send the message'], ['Shift + Enter', 'Start a new line'], ['Tab', 'Move to attach, the tools, then Send or Stop']] },
  MessageList: { keys: [['Tab', 'Focus the list so it can be scrolled'], ['↑ ↓, Page Up, Page Down', 'Scroll, once the list has focus']] },
  Reasoning: { keys: [['Enter or Space', 'Open or close the thinking']] },
  ModelPicker: { keys: menu },
  Navbar: { keys: [['Enter or Space', 'Open or close the links, on the menu button of a narrow bar'], ['Esc', 'Close the links and return focus to the menu button']] },
  Sidebar: { keys: [['Enter or Space', 'Collapse or expand, on the collapse button'], ['Esc', 'Dismiss the tooltip on a collapsed link']] },
  AppShell: { keys: [['Tab', 'The first stop is a link that skips to the content'], ['Esc', 'Close the navigation sheet on a narrow shell']] },
  Tabs: { keys: [['← →', 'Previous or next tab'], ['Home, End', 'First or last tab']] },
  Menu: { keys: menu },
  DotsMenu: { keys: menu },
  SplitButton: { keys: menu, note: 'The main button and the arrow are separate tab stops.' },
  ContextMenu: { keys: [['Shift + F10 or the Menu key', 'Open the menu for the focused element'], ...menu.slice(1)] },
  CommandMenu: {
    keys: [['⌘K or Ctrl + K', 'Open or close, from anywhere on the page'], ['↑ ↓', 'Move between results'], ['Home, End', 'First or last result'], ['Enter', 'Run the highlighted command'], ['Esc', 'Close']],
  },
  Dialog: { keys: modal },
  Sheet: { keys: modal },
  DestructiveActionModal: { keys: modal, note: 'Focus starts on Cancel, or in the text field when a name must be typed.' },
  Collapse: { keys: [['Enter or Space', 'Open or close the section'], ['↑ ↓', 'Previous or next heading'], ['Home, End', 'First or last heading']] },
  FileTree: {
    keys: [['↑ ↓', 'Previous or next row'], ['→', 'Open a folder, or step into it'], ['←', 'Close a folder, or step out to its parent'], ['Home, End', 'First or last row'], ['Enter or Space', 'Open a folder, or select a file']],
    note: 'The whole tree is one tab stop.',
  },
  Table: { keys: [['Enter or Space', 'On a column header, sort by that column'], ['Space', 'On a row checkbox, select the row']], note: 'Shift-click on a checkbox selects a range.' },
  Tooltip: { keys: hover },
  ContextCard: { keys: hover, note: 'Focus never moves into the card, so it cannot trap anyone.' },
  RelativeTimeCard: { keys: hover },
  Toast: { keys: [['F8', 'Move focus to the notifications']] },
  Scroller: { keys: [['← →', 'Scroll the strip while it has focus']] },
};
