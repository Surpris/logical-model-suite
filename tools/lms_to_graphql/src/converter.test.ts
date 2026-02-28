import { describe, it, expect } from 'vitest';
import { convertLogicalModelToGraphQL } from './converter.js';
import { LogicalModel } from './types.js';

describe('convertLogicalModelToGraphQL', () => {
  it('converts a simple logical model to GraphQL schema', () => {
    const model = {
      model_name: 'TestModel',
      description: 'A test model',
      entities: {
        User: {
          description: 'A user entity',
          attributes: {
            id: { type: 'String', primary_key: true, description: 'User ID' },
            name: { type: 'String', required: true },
            age: { type: 'Integer' },
          },
        },
      },
    } as unknown as LogicalModel;

    const schema = convertLogicalModelToGraphQL(model);
    expect(schema).toContain('type Query {');
    expect(schema).toContain('  user(id: ID!): User');
    expect(schema).toContain('type User {');
    expect(schema).toContain('id: ID!');
    expect(schema).toContain('name: String!');
    expect(schema).toContain('age: Int');
    expect(schema).toContain('"""\nA test model\n"""');
    expect(schema).toContain('"""\nA user entity\n"""');
    expect(schema).toContain('"User ID"\n  id: ID!');
  });

  it('handles relationships', () => {
    const model = {
      model_name: 'TestModel',
      entities: {
        User: {
          attributes: {
            id: { type: 'String', primary_key: true },
          },
          relationships: {
            posts: {
              target: 'Post',
              cardinality: '0:N',
              description: 'User posts',
            },
          },
        },
        Post: {
          attributes: {
            id: { type: 'String', primary_key: true },
          },
        },
      },
    } as unknown as LogicalModel;

    const schema = convertLogicalModelToGraphQL(model);
    expect(schema).toContain('posts: [Post]');
    expect(schema).toContain('"User posts"\n  posts: [Post]');
  });

  it('handles relationships with attributes (intermediate type)', () => {
    const model = {
      model_name: 'TestModel',
      entities: {
        User: {
          attributes: {
            id: { type: 'String', primary_key: true },
          },
          relationships: {
            managedDatasets: {
              target: 'Dataset',
              cardinality: '0:N',
              attributes: {
                role: { type: 'String', required: true },
              },
            },
          },
        },
        Dataset: {
          attributes: {
            id: { type: 'String', primary_key: true },
          },
        },
      },
    } as unknown as LogicalModel;

    const schema = convertLogicalModelToGraphQL(model);
    // Should create UserManagedDatasets
    expect(schema).toContain('type UserManagedDatasets {');
    expect(schema).toContain('target: Dataset!');
    expect(schema).toContain('role: String!');
    expect(schema).toContain('managedDatasets: [UserManagedDatasets]');
  });
});
