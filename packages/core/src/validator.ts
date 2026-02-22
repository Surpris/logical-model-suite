import Ajv, { ErrorObject } from 'ajv';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { LogicalDataModelIntermediateRepresentationSchema } from './types/logical_model';
import schema from './schemas/logical_model/logical_model_schema_definition.json';

export { ErrorObject };

const ajv = new Ajv();
const validate = ajv.compile<LogicalDataModelIntermediateRepresentationSchema>(schema as any);

export class LogicalModelValidator {
  static validate(data: unknown): { valid: boolean; errors?: ErrorObject[] } {
    const valid = validate(data);
    if (!valid) {
      return { valid: false, errors: validate.errors || [] };
    }
    return { valid: true };
  }

  static validateFile(filePath: string): { valid: boolean; errors?: ErrorObject[]; data?: LogicalDataModelIntermediateRepresentationSchema } {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = yaml.load(content);
      const validationResult = this.validate(data);
      if (!validationResult.valid) {
        return validationResult;
      }
      return { valid: true, data: data as LogicalDataModelIntermediateRepresentationSchema };
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
