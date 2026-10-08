import { expect, test } from 'vitest';
// @ts-expect-error plain JS module without types
import { transform } from './on-approve-to-on-allow.mjs';

test('renames onApprove on ApprovalPrompt only', () => {
  const input = `
const a = <ApprovalPrompt action="x" onApprove={(s) => go(s)} onDeny={stop} />;
const b = (
  <Kit.ApprovalPrompt
    onApprove={handle}
  >
  </Kit.ApprovalPrompt>
);
const c = <OtherThing onApprove={keep} />;
const d = "onApprove stays in strings"; // and onApprove in comments
`;
  const { source, count } = transform(input);
  expect(count).toBe(2);
  expect(source).toContain('<ApprovalPrompt action="x" onAllow={(s) => go(s)}');
  expect(source).toContain('    onAllow={handle}');
  expect(source).toContain('<OtherThing onApprove={keep} />');
  expect(source).toContain('"onApprove stays in strings"; // and onApprove in comments');
});

test('leaves files without the prop untouched', () => {
  const input = '<ApprovalPrompt onAllow={go} />';
  expect(transform(input)).toEqual({ source: input, count: 0 });
});
