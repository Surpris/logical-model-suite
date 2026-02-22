# lms-to-prisma (Logical Model to Prisma Generator)

A generator that converts and extends Logical Data Models (YAML) into Prisma Schemas.

## Overview

This project aims to automatically convert **Logical Data Models (YAML)** from a business perspective into **Prisma Schemas** for system implementation.
It separates domain definitions from system implementation details (UUIDs, audit logs, logical deletion, etc.), allowing YAML files to be managed as the "Single Source of Truth".

## Features

- **Automatic Conversion from Logical Models**: Converts entities, attributes, and relationships defined in YAML into Prisma models.
- **Automatic Injection of System Fields**: Automatically adds `id` (UUID), `createdAt`, `updatedAt`, and `deletedAt` (for logical deletion) to all models.
- **Automatic Naming Convention Adjustment**: Converts snake_case in YAML to Prisma's recommended PascalCase (for model names) and camelCase (for field names).
- **Relationship Resolution**: Infers and generates the bidirectional relationships required by Prisma from the unidirectional relationships defined in YAML.
- **System Model Integration**: Automatically appends common system models, such as `UserDefinedRelationship` for handling graph structures, to the end of the generated schema.

## Tech Stack

- **Language**: TypeScript (Node.js)
- **Data Format**: YAML (`yaml` package)
- **Validation**: AJV (JSON Schema)
- **Testing**: Vitest
- **ORM**: Prisma

## Directory Structure

- `src/index.ts`: CLI entry point
- `src/core/`: Core conversion logic (`PrismaSchemaBuilder`, etc.)
- `src/templates/`: Static Prisma models to be appended to the schema
- `sample/`: Sample Logical Data Models (YAML)
- `schema/`: JSON Schema for YAML validation
- `docs/`: Specifications and implementation plans
- `prisma/`: Output destination for the generated Prisma schema

## Usage

### Installation

```bash
npm install
```

### Schema Generation

By default, it reads `logical_model.yaml` in the current directory and outputs `prisma/schema.prisma`.
To run with a sample, specify the input as follows:

```bash
npm run generate:schema -- --input sample/logical_model.yaml
```

### Running Tests

```bash
npm test
```

### Type Check and Linter

```bash
npm run typecheck
```

## Development Workflow

1. Edit `sample/logical_model.yaml` or similar to define the domain model.
2. Run `npm run generate:schema` to update the Prisma schema.
3. Check the diff in `prisma/schema.prisma` and run migrations if necessary.
