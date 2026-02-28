import { describe, it, expect, vi } from 'vitest';
import { Validator } from './validator.js';
import { LogicalModelValidator, ErrorObject } from '@lms/core';

// Mock LogicalModelValidator
vi.mock('@lms/core', () => {
  return {
    LogicalModelValidator: {
      validate: vi.fn(),
    },
  };
});

describe('Validator', () => {
  it('validates a correct model', () => {
    const mockValidate = vi.mocked(LogicalModelValidator.validate);
    mockValidate.mockReturnValue({ valid: true });

    const validator = new Validator();
    const model = {
      entities: {
        User: {
          relationships: {
            posts: { target: 'Post' },
          },
        },
        Post: {},
      },
    };

    const result = validator.validate(model);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('detects referential integrity errors', () => {
    const mockValidate = vi.mocked(LogicalModelValidator.validate);
    mockValidate.mockReturnValue({ valid: true });

    const validator = new Validator();
    const model = {
      entities: {
        User: {
          relationships: {
            posts: { target: 'Post' }, // Post entity does not exist
          },
        },
      },
    };

    const result = validator.validate(model);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Reference Error: Entity 'User' relationship 'posts' points to missing entity 'Post'",
    );
  });

  it('detects schema errors from @lms/core', () => {
    const mockValidate = vi.mocked(LogicalModelValidator.validate);
    mockValidate.mockReturnValue({
      valid: false,
      errors: [
        {
          instancePath: '/entities/User',
          message: 'must have attributes',
        } as unknown as ErrorObject,
      ],
    });

    const validator = new Validator();
    const model = {};

    const result = validator.validate(model);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      'Schema Error: Path /entities/User - must have attributes',
    );
  });
});
