import { LogicalModelValidator, ErrorObject } from '@lms/core';
import { LogicalModel, Entity, Relationship } from './types';

/**
 * Validates the logical model using @lms/core validator and additional referential integrity checks.
 */
export class Validator {
  /**
   * Validates the given data against the schema and referential integrity rules.
   * @param data The data to validate.
   * @returns An object containing a validity flag and a list of error strings.
   */
  public validate(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 1. Schema Validation (via @lms/core)
    const result = LogicalModelValidator.validate(data);
    if (!result.valid && result.errors) {
      result.errors.forEach((err: ErrorObject) => {
        errors.push(`Schema Error: Path ${err.instancePath} - ${err.message}`);
      });
    }

    // 2. Referential Integrity Validation
    // We attempt this even if schema validation failed, providing the structure allows it.
    if (data && typeof data === 'object' && 'entities' in data) {
      const integrityErrors = this.checkReferentialIntegrity(data as LogicalModel);
      errors.push(...integrityErrors);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Checks if all relationship targets exist as entities.
   * @param data The logical model.
   * @returns A list of error messages.
   */
  private checkReferentialIntegrity(data: LogicalModel): string[] {
    const errors: string[] = [];
    const entities = data.entities || {};
    const entityNames = new Set(Object.keys(entities));

    for (const [entityName, entity] of Object.entries(entities)) {
      if (entity.relationships) {
        for (const [relName, rel] of Object.entries(entity.relationships)) {
          if (!entityNames.has(rel.target)) {
            errors.push(`Reference Error: Entity '${entityName}' relationship '${relName}' points to missing entity '${rel.target}'`);
          }
        }
      }
    }
    return errors;
  }
}
