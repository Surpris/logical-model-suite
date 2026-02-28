import { describe, it, expect } from 'vitest';
import { generateTypeScript } from './generator.js';

describe('TypeScript Generator', () => {
  it('should generate entities with correct types and optionality', () => {
    const yamlContent = `
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
      age:
        type: Integer
        required: false
      role:
        type: Enum
        options: ["ADMIN", "USER"]
        required: true
`;
    const result = generateTypeScript(yamlContent);

    expect(result).toContain('export interface User {');
    expect(result).toContain('  id: string;');
    expect(result).toContain('  age?: number;');
    expect(result).toContain('  role: "ADMIN" | "USER";');
    expect(result).toContain('/**');
    expect(result).toContain(' * User entity');
    expect(result).toContain(' */');
  });

  it('should generate relationship interfaces correctly', () => {
    const yamlContent = `
model_name: TestModel
schema_version: "1.0"
entities:
  User:
    attributes:
      id:
        type: String
        primary_key: true
        required: true
    relationships:
      has_posts:
        target: Post
        cardinality: "1:N"
        description: "User has posts"
        attributes:
          since:
            type: Date
            required: true
  Post:
    attributes:
      post_id:
        type: Integer
        primary_key: true
        required: true
`;
    const result = generateTypeScript(yamlContent);

    // Relationship interface name should be Source_PascalRelationName_Target
    expect(result).toContain('export interface User_HasPosts_Post {');
    expect(result).toContain('  type: "has_posts";');
    expect(result).toContain('  source_id: string;'); // User PK type is string
    expect(result).toContain('  target_id: number;'); // Post PK type is number
    expect(result).toContain('  since: Date;');
    expect(result).toContain(' * User has posts');
    expect(result).toContain(' * @note Cardinality: 1:N');
  });

  it('should fallback to string if PK type is unknown or missing', () => {
    const yamlContent = `
model_name: TestModel
schema_version: "1.0"
entities:
  User:
    attributes:
      id:
        type: UnknownType
        primary_key: true
        required: true
  Group:
    attributes:
      name:
        type: String
        required: true
    relationships:
      belongs_to:
        target: User
        cardinality: "N:1"
`;
    const result = generateTypeScript(yamlContent);

    // Group belongs_to User
    // target User PK type should fallback to string
    // source Group PK is missing, so string fallback
    expect(result).toContain('export interface Group_BelongsTo_User {');
    expect(result).toContain('  source_id: string;');
    expect(result).toContain('  target_id: string;');
  });
});
