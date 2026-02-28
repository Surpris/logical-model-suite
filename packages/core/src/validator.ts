import { Ajv } from 'ajv';
import type { ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { LogicalDataModelIntermediateRepresentationSchema as LogicalModel } from './types/logical_model.js';
import { LogicalDataModelIntermediateRepresentationSchema as LogicalModelWithContext } from './types/logical_model_with_context.js';
import { LogicalDataModelModularSchema as SeparatedLogicalModel } from './types/separated_logical_model.js';
import { LogicalDataModelMappingDefinitionSchema as LogicalModelMapping } from './types/logical_model_mapping.js';

import logicalModelSchema from './schemas/logical_model/logical_model_schema_definition.json' with { type: 'json' };
import logicalModelWithContextSchema from './schemas/logical_model/logical_model_with_context_schema_definition.json' with { type: 'json' };
import separatedLogicalModelSchema from './schemas/logical_model/separated_logical_model_schema_definition.json' with { type: 'json' };
import logicalModelMappingSchema from './schemas/logical_model_mapping/logical_model_mapping_schema_definition.json' with { type: 'json' };

export { ErrorObject };

const ajv = new Ajv({
  strict: false,
  allowUnionTypes: true,
});
// eslint-disable-next-line @typescript-eslint/no-explicit-any
((addFormats as any).default ?? addFormats)(ajv);

const validators = {
  logical_model: ajv.compile<LogicalModel>(logicalModelSchema),
  logical_model_with_context: ajv.compile<LogicalModelWithContext>(
    logicalModelWithContextSchema,
  ),
  separated_logical_model: ajv.compile<SeparatedLogicalModel>(
    separatedLogicalModelSchema,
  ),
  logical_model_mapping: ajv.compile<LogicalModelMapping>(
    logicalModelMappingSchema,
  ),
};

export type ModelType = keyof typeof validators;

export class LogicalModelValidator {
  static validate(
    data: unknown,
    type: ModelType = 'logical_model',
  ): { valid: boolean; errors?: ErrorObject[] } {
    const validate = validators[type];
    const valid = validate(data);
    if (!valid) {
      return { valid: false, errors: validate.errors || [] };
    }
    return { valid: true };
  }

  static validateFile(
    filePath: string,
    type: ModelType = 'logical_model',
  ): { valid: boolean; errors?: ErrorObject[]; data?: unknown } {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = yaml.load(content);
      const validationResult = this.validate(data, type);
      if (!validationResult.valid) {
        return validationResult;
      }
      return { valid: true, data };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        valid: false,
        errors: [
          {
            keyword: 'parse',
            message,
            instancePath: '',
            schemaPath: '',
            params: {},
          },
        ],
      };
    }
  }
}
