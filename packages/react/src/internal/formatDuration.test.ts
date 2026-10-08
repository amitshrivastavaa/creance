import { expect, test } from 'vitest';
import { formatDuration } from './formatDuration';

test('formats seconds, minutes and hours', () => {
  expect(formatDuration(0)).toBe('0s');
  expect(formatDuration(12_400)).toBe('12s');
  expect(formatDuration(125_000)).toBe('2m 05s');
  expect(formatDuration(3_720_000)).toBe('1h 02m');
  expect(formatDuration(-5)).toBe('0s');
});
