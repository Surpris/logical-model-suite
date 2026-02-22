import Ajv, { ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { LogicalDataModelIntermediateRepresentationSchema as LogicalModel } from './types/logical_model';
import { LogicalDataModelIntermediateRepresentationSchema as LogicalModelWithContext } from './types/logical_model_with_context';
import { LogicalDataModelModularSchema as SeparatedLogicalModel } from './types/separated_logical_model';
import { LogicalDataModelMappingDefinitionSchema as LogicalModelMapping } from './types/logical_model_mapping';

import logicalModelSchema from './schemas/logical_model/logical_model_schema_definition.json';
import logicalModelWithContextSchema from './schemas/logical_model/logical_model_with_context_schema_definition.json';
import separatedLogicalModelSchema from './schemas/logical_model/separated_logical_model_schema_definition.json';
import logicalModelMappingSchema from './schemas/logical_model_mapping/logical_model_mapping_schema_definition.json';

export { ErrorObject };

const ajv = new Ajv({
  strict: false,
  allowUnionTypes: true,
});
addFormats(ajv);

const validators = {
  logical_model: ajv.compile<LogicalModel>(logicalModelSchema as any),
  logical_model_with_context: ajv.compile<LogicalModelWithContext>(logicalModelWithContextSchema as any),
  separated_logical_model: ajv.compile<SeparatedLogicalModel>(separatedLogicalModelSchema as any),
  logical_model_mapping: ajv.compile<LogicalModelMapping>(logicalModelMappingSchema as any),
};

export type ModelType = keyof typeof validators;

export class LogicalModelValidator {
  static validate(data: unknown, type: ModelType = 'logical_model'): { valid: boolean; errors?: ErrorObject[] } {
    const validate = validators[type];
    const valid = validate(data);
    if (!valid) {
      return { valid: false, errors: validate.errors || [] };
    }
    return { valid: true };
  }

  static validateFile(filePath: string, type: ModelType = 'logical_model'): { valid: boolean; errors?: ErrorObject[]; data?: any } {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = yaml.load(content);
      const validationResult = this.validate(data, type);
      if (!validationResult.valid) {
        return validationResult;
      }
      return { valid: true, data };
    } catch (error: any) {
      return {
        valid: false,
        errors: [
          {
            keyword: 'parse',
            message: error.message,
            instancePath: '',
            schemaPath: '',
            params: {},
          },
        ],
      };
    }
  }
}
