# LMS Mapping Tool

A toolkit for defining mappings between Logical Data Models (LMS) and converting data instances based on those mappings.

This tool provides an ecosystem to facilitate data interoperability between different logical models (e.g., converting a University DMP model to a Government Common DMP model) through configuration files, without the need for custom coding for each pair of models.

## Features

This tool offers two main functionalities:

1. **Mapping Definition Validation**
   - Validates mapping definition files (YAML/JSON) against the `logical_model_mapping_schema_definition.json`.
   - Ensures that the mapping rules for entities, attributes, and relationships are structurally correct.

2. **Data Transformation Engine**
   - Converts source LMS data (YAML) into target LMS data based on the provided mapping definition.
   - Supports:
     - **Attribute Mapping**: Direct copy, static values, value translation (enum mapping), and ignoring fields.
     - **Structural Transformation**: creating nested objects and mapping flat attributes to nested paths.
     - **Relationship Mapping**: Recursive processing of child entities and handling inverse relationships (setting parent references on children).

## Installation

(Instructions to be added once the package structure is finalized. Typically `npm install` or local build.)

```bash
# Example
npm install
npm run build
```

## Usage

The tool is provided as a Command Line Interface (CLI).

### 1. Validate a Mapping Definition

Check if your mapping configuration file is valid according to the schema.

```bash
lms-map validate path/to/mapping_definition.yaml
```

### 2. Convert Data

Convert a data file from the Source Model to the Target Model using a mapping definition.

```bash
lms-map convert path/to/source_data.yaml path/to/mapping_definition.yaml [options]
```

**Options:**

- `-o, --output <path>`: Specify the output file path (default: stdout or derived filename).
- `--verbose`: Enable detailed logging.

## Documentation

For detailed specifications and implementation details, please refer to:

- [Specifications](docs/specifications.md)
