import { describe, expect, it } from 'vitest';
import { ApiRequestError } from './api';

describe('ApiRequestError', () => {
  it('includes server field errors in the user-facing message', () => {
    const error = new ApiRequestError({
      code: 'LISTING_PUBLICATION_INVALID',
      message: 'Complete the required listing fields.',
      fields: {
        targetBudgetAmount: 'Target budget is required.',
        availability_date: 'A date is required.',
      },
    }, 400);

    expect(error.message).toContain('Complete the required listing fields.');
    expect(error.message).toContain('target budget amount: Target budget is required.');
    expect(error.message).toContain('availability date: A date is required.');
  });

  it('preserves the original message when there are no field errors', () => {
    const error = new ApiRequestError({
      code: 'REQUEST_FAILED',
      message: 'Please try again.',
    }, 500);

    expect(error.message).toBe('Please try again.');
  });
});
