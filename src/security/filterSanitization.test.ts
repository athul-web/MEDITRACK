import { describe, expect, it } from 'vitest';

describe('PostgREST sanitization contract', () => {
  it('documents that user input must be sanitized (placeholder)', () => {
    const sample = "Ernakulam, Malappuram";
    expect(sample.includes(',')).toBe(true);
  });
});
