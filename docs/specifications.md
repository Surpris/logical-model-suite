# Logical Model Suite Specifications

## 1. Project Overview

Logical Model Suite (LMS) is a suite of tools for defining, validating, and converting logical data models into various implementation schemas. It aims to provide an ecosystem that centers on "logical models" which abstract data structures, thereby improving development efficiency and maintaining consistency in data definitions.

## 2. Core Concepts

### 2.1. Definition of Logical Models

- **Format**: Written in YAML format.
- **Structure Control**: The structure is defined and controlled by JSON Schema.

### 2.2. Multi-Platform Deployment

Automatically generates the following implementation schemas from a single logical model definition:

- TypeScript Interfaces
- Prisma Schemas (`.prisma`)
- GraphQL Schemas

## 3. Project Structure

The repository consists of the following main components:

### 3.1. Schema Definitions (`schema_definitions/`)

Stores the JSON Schema that defines the structure of the logical model itself.

### 3.2. Conversion Tools (`tools/`)

A set of tools that perform conversions from the logical model to each target.

- **lms_to_prisma**: Generates Prisma schemas from logical models.
- **lms_to_ts-interface**: Generates TypeScript interface definitions from logical models.
- **lms_to_graphql**: Generates GraphQL schemas from logical models.
- **lms_mapping**: A tool for performing model-to-model conversions and mapping (Python-based).

### 3.3. Samples (`samples/`)

Contains concrete examples of model definitions (e.g., JSPS DMP, CAO metadata).

## 4. Technology Stack

- **Development Languages**: TypeScript, Node.js, Python
- **Validation**: AJV (JSON Schema Validator)
- **Test Framework**: Vitest
- **Data Formats**: YAML, JSON Schema

## 5. Development Guidelines

Each tool is managed in an independent directory (`tools/*`) and uses a standard `npm` command system for development, building, and testing.

### Development Flow Example

1. Install dependencies (`npm install`)
2. Run tests (`npm run test`)
3. Run type check and linter (`npm run typecheck`)
4. Execute schema generation (`npm run generate:schema`)
