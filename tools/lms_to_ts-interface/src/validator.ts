import * as yaml from 'js-yaml';
import { LogicalModelValidator, ErrorObject } from '@lms/core';
import { YamlSchema, EntityDef, RelationshipDef } from './types.js';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export class ModelValidator {
  constructor() {
    // No initialization needed for @lms/core validator
  }

  public validate(yamlContent: string): ValidationResult {
    const errors: string[] = [];
    let data: YamlSchema;

    try {
      data = yaml.load(yamlContent) as YamlSchema;
    } catch (e: unknown) {
      return { valid: false, errors: [`YAML Parse Error: ${(e as Error).message}`] };
    }

    // A. Schema Validation (via @lms/core)
    const validationResult = LogicalModelValidator.validate(data);
    if (!validationResult.valid && validationResult.errors) {
      validationResult.errors.forEach((err: ErrorObject) => {
        errors.push(
          `[Schema] Path: ${err.instancePath} | Message: ${err.message}`,
        );
      });
    }

    // B. Referential Integrity Validation (Logic)
    const integrityErrors = this.checkReferentialIntegrity(data);
    errors.push(...integrityErrors);

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private checkReferentialIntegrity(data: YamlSchema): string[] {
    const errors: string[] = [];
    const entityNames = new Set(Object.keys(data.entities || {}));

    for (const [entityName, entityDef] of Object.entries(
      data.entities || {},
    ) as [string, EntityDef][]) {
      if (!entityDef.relationships) continue;

      for (const [relName, relDef] of Object.entries(
        entityDef.relationships,
      ) as [string, RelationshipDef][]) {
        const target = relDef.target;

        if (!entityNames.has(target)) {
          errors.push(
            `[Integrity] Broken Link in [${entityName}]: relationship '${relName}' targets missing entity '${target}'`,
          );
        }
      }
    }
    return errors;
  }
}
