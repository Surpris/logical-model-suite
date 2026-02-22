# lms_to_ts-interface Specifications

## 1. Overview

`lms_to_ts-interface` is a toolset designed to process Logical Data Models defined in YAML. It provides functionality to validate these model definitions and generate TypeScript interface definitions from them. This ensures consistency between the design (Logical Model) and the implementation (TypeScript code), serving as a Single Source of Truth.

## 2. CLI Commands

The package provides two main executable commands.

### 2.1. Validation Command (`lms-val`)

Validates the structure and integrity of Logical Model YAML files.

**Usage:**

```bash
lms-val [path]
```

- `[path]`: Path to a YAML file or a directory containing YAML files. Defaults to current directory `.` if not specified.

**Behavior:**

- Scans for `.yaml` or `.yml` files in the target path.
- Performs validation on each file.
- Outputs `✅ OK` for valid files and `❌ Failed` with error details for invalid ones.
- Exits with code `1` if any file fails validation.

### 2.2. Generation Command (`lms-gen`)

Generates TypeScript type definitions (`.ts`) from Logical Model YAML files.

**Usage:**

```bash
lms-gen [path]
```

- `[path]`: Path to a YAML file or a directory containing YAML files. Defaults to current directory `.` if not specified.

**Behavior:**

- Scans for `.yaml` or `.yml` files in the target path.
- Generates a corresponding TypeScript file for each YAML file.
  - Output filename format: `[InputFilename]_types.ts`
  - Location: Same directory as the input file.
- Outputs log messages indicating the generation status.

### 2.3. Lint Command

Uses Spectral to lint the YAML files against defined rules.

**Usage:**

```bash
npm run lint
```

## 3. Validation Logic

The `lms-val` command performs the following checks:

1. **YAML Syntax**: Ensures the file is valid YAML.
2. **Schema Validation**: Validates the JSON structure against the Logical Model Schema (`logical_model_schema.json`) using `ajv`.
3. **Referential Integrity**: Checks that all `target` entities specified in `relationships` actually exist within the defined model.
   - Error format: `[Integrity] Broken Link in [EntityName]: relationship 'RelName' targets missing entity 'TargetName'`

## 4. Generation Logic

The `lms-gen` command maps Logical Model definitions to TypeScript interfaces.

### 4.1. Type Mapping

Logical Model types are mapped to TypeScript types as follows:

| Logical Type       | TypeScript Type | Note                           |
| :----------------- | :-------------- | :----------------------------- |
| `String`, `Text`   | `string`        |                                |
| `Integer`, `Float` | `number`        |                                |
| `Boolean`          | `boolean`       |                                |
| `Date`, `DateTime` | `Date`          |                                |
| `Enum`             | String Union    | e.g., `"OptionA" \| "OptionB"` |
| Others             | `any`           | Fallback for unknown types     |

### 4.2. Entity Generation

- Each entity is converted to an exported `interface`.
- Interface name matches the Entity name.
- Attributes are converted to properties.
  - `required: false` attributes become optional properties (`?`).
- JSDoc comments are generated from `description` and `note` fields.

### 4.3. Relationship Generation

Relationships are treated as independent edges (Property Graph model) and generated as separate interfaces.

- **Interface Name Format**: `[SourceEntity]_[PascalCase(RelationName)]_[TargetEntity]`
- **Standard Properties**:
  - `type`: Literal type of the relation name.
  - `source_id`: Type matches the Primary Key of the Source Entity (default: `string`).
  - `target_id`: Type matches the Primary Key of the Target Entity (default: `string`).
- **Attributes**:
  - Relationship attributes (`attributes` defined in `relationships`) are added as properties, following the same mapping rules as Entity attributes.

## 5. Requirements Traceability

This tool fulfills the requirements defined in `docs/requirements.json`:

| ID          | Requirement                         | Implementation                                                                                   |
| :---------- | :---------------------------------- | :----------------------------------------------------------------------------------------------- |
| **REQ-001** | YAML-based Logical Model Definition | Supported by `lms-val` and `lms-gen` which parse YAML files.                                     |
| **REQ-002** | Automatic Model Validation          | Implemented in `lms-val` (Schema validation + Referential integrity).                            |
| **REQ-003** | TypeScript Type Generation          | Implemented in `lms-gen`.                                                                        |
| **REQ-004** | Relationship (Edge) Attributes      | Implemented in `lms-gen`; relationship attributes are included in the generated Edge interfaces. |

## 6. Technical Stack

- **Language**: TypeScript
- **Runtime**: Node.js (executed via `ts-node`)
- **Libraries**:
  - `js-yaml`: For YAML parsing.
  - `ajv`: For JSON Schema validation.
  - `@stoplight/spectral-cli`: For linting.
