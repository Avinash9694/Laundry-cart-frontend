import { describe, expect, it } from 'vitest';
import { formatINR, pluralize } from './format';

describe('format helpers', () => {
  it('formats whole rupees in the Indian grouping', () => {
    expect(formatINR(0)).toBe('₹0');
    expect(formatINR(1234567)).toBe('₹12,34,567');
  });
  it('pluralises with an irregular override', () => {
    expect(pluralize(1, 'item')).toBe('1 item');
    expect(pluralize(3, 'item')).toBe('3 items');
    expect(pluralize(2, 'saree', 'sarees')).toBe('2 sarees');
  });
});
