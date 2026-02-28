import { describe, it, expect } from 'vitest';
import { ModelValidator } from './validator.js';

describe('ModelValidator', () => {
  const validator = new ModelValidator();

  it('should validate a correct YAML schema', () => {
    const validYaml = `
model_name: TestModel
schema_version: "1.0"
entities:
  User:
    description: "User entity"
    attributes:
      id:
        description: "User ID"
        type: String
        primary_key: true
        required: true
      name:
        description: "User Name"
        type: String
        required: true
  Post:
    description: "Post entity"
    attributes:
      id:
        description: "Post ID"
        type: String
        primary_key: true
        required: true
      title:
        description: "Post Title"
        type: String
        required: true
    relationships:
      author:
        target: User
        description: "Author of the post"
        cardinality: "1:1"
`;
    const result = validator.validate(validYaml);
    if (!result.valid) {
      console.log(result.errors);
    }
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should return error for invalid YAML syntax', () => {
    const invalidYaml = `
model_name: TestModel
schema_version: "1.0"
entities:
  User:
    description: "User entity"
    attributes:
      id:
        type: String
        primary_key: true
        required: true
     invalid_indentation_here
`;
    const result = validator.validate(invalidYaml);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('YAML Parse Error');
  });

  it('should return error for schema validation failure (missing required fields)', () => {
    const invalidSchemaYaml = `
# Missing model_name and schema_version
entities:
  User:
    attributes:
      id:
        type: String
        primary_key: true
        required: true
`;
    const result = validator.validate(invalidSchemaYaml);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('[Schema]');
  });

  it('should return error for referential integrity failure (broken link)', () => {
    const brokenLinkYaml = `
model_name: TestModel
schema_version: "1.0"
entities:
  Post:
    description: "Post entity"
    attributes:
      id:
        type: String
        primary_key: true
        required: true
    relationships:
      author:
        target: NonExistentUser
        cardinality: "1:1"
`;
    const result = validator.validate(brokenLinkYaml);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some((err) => err.includes('[Integrity]'))).toBe(true);
    expect(
      result.errors.some((err) =>
        err.includes("targets missing entity 'NonExistentUser'"),
      ),
    ).toBe(true);
  });
});
