# Logical Model to TypeScript Interface

A toolset for converting Logical Data Models (YAML) into TypeScript interfaces and validating their integrity.

## Features

- **YAML-based Modeling**: Define your data models in simple, human-readable YAML.
- **Automatic Validation**:
  - Validates syntax against the Logical Model JSON Schema.
  - Checks referential integrity (ensures relationships point to existing entities).
- **TypeScript Generation**:
  - Generates strict TypeScript interfaces.
  - Supports Property Graph modeling by generating separate interfaces for Relationships (Edges).
  - Handles JSDoc generation from descriptions.

## Installation

```bash
npm install
```

## Usage

### 1. Validate a Model

Checks the YAML file for schema violations and broken links.

```bash
# Using ts-node directly
npx ts-node src/bin/lms-val.ts <path-to-yaml-or-directory>

# Example
npx ts-node src/bin/lms-val.ts ../../samples/cao_metadata/
```

### 2. Generate TypeScript Interfaces

Generates `_types.ts` files for each YAML model in the target directory.

```bash
# Using ts-node directly
npx ts-node src/bin/lms-gen.ts <path-to-yaml-or-directory>

# Example
npx ts-node src/bin/lms-gen.ts ../../samples/cao_metadata/
```

### 3. Linting

Uses Spectral to lint the YAML files against best practices and custom rules.

```bash
npm run lint
```

### 4. Examples (Programmatic Usage)

You can call the core generation functions from your TypeScript code. See the `examples` directory for details.

```bash
# Run the basic generation example
npx tsx tools/lms_to_ts-interface/examples/basic-generation.ts
```

## Model Definition Guide

Define your Logical Model in a YAML file (e.g., `model.yaml`).

### Structure

```yaml
schema_version: '1.0'
model_name: 'MyProject'

entities:
  User:
    description: 'System user'
    attributes:
      id:
        type: String
        primary_key: true
        required: true
      name:
        type: String
        required: true
      role:
        type: Enum
        options: ['Admin', 'User', 'Guest']

  Group:
    description: 'User group'
    attributes:
      id:
        type: String
        primary_key: true
    relationships:
      has_member:
        target: User
        cardinality: '1:N'
        description: 'Group members'
        attributes:
          joined_at:
            type: DateTime
            description: 'Date when user joined the group'
```

### Generated Output (`model_types.ts`)

```typescript
/**
 * System user
 */
export interface User {
  id: string;
  name: string;
  role?: 'Admin' | 'User' | 'Guest';
}

/**
 * User group
 */
export interface Group {
  id: string;
}

// ==========================================
// Relationships (Edges)
// ==========================================

/**
 * Group members
 * Cardinality: 1:N
 */
export interface Group_HasMember_User {
  /** Relationship Type Identifier */
  type: 'has_member';
  /** Source Entity ID (Group) */
  source_id: string;
  /** Target Entity ID (User) */
  target_id: string;
  /** Date when user joined the group */
  joined_at?: Date;
}
```

## Development

- **Lint**: `npm run lint`
- **Build/Test**: Ensure you have dependencies installed. The tools are written in TypeScript and executed via `ts-node`.

## Documentation

- [Detailed Specifications](docs/specifications.md)
