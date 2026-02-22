import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { LogicalModelValidator } from './validator.js';

vi.mock('fs');

describe('LogicalModelValidator', () => {
  const validLogicalModel = {
    schema_version: '1.0',
    model_name: 'TestModel',
    description: 'A test model',
    entities: {
      User: {
        description: 'A user entity',
        attributes: {
          id: {
            type: 'String',
            description: 'User ID',
            required: true,
            primary_key: true,
          },
        },
      },
    },
  };

  const validLogicalModelWithContext = {
    schema_version: '1.0',
    model_name: 'ContextModel',
    entities: {
      Person: {
        context: 'http://schema.org/Person',
        description: 'A person',
        attributes: {
          name: {
            context: 'http://schema.org/name',
            type: 'String',
            description: 'Name',
          },
        },
      },
    },
  };

  const validSeparatedLogicalModelMaster = {
    schema_version: '1.0',
    model_name: 'SeparatedModel',
    description: 'A separated model',
  };

  const validSeparatedLogicalModelFragment = {
    entities: {
      FragmentEntity: {
        description: 'A fragment entity',
        attributes: {
          attr: {
            type: 'String',
            description: 'Attr',
          },
        },
      },
    },
  };

  const validLogicalModelMapping = {
    mapping_id: 'test-mapping',
    source_model: 'SourceModel',
    target_model: 'TargetModel',
    entity_mappings: [
      {
        source_selector: { name: 'SourceEntity' },
        target_selector: { name: 'TargetEntity' },
        attribute_mappings: [
          {
            source_attribute: 'src_attr',
            target_attribute: 'tgt_attr',
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('validate', () => {
    it('should validate logical_model (default)', () => {
      const result = LogicalModelValidator.validate(validLogicalModel);
      expect(result.valid).toBe(true);
    });

    it('should validate logical_model_with_context', () => {
      const result = LogicalModelValidator.validate(
        validLogicalModelWithContext,
        'logical_model_with_context',
      );
      expect(result.valid).toBe(true);
    });

    it('should validate separated_logical_model (master)', () => {
      const result = LogicalModelValidator.validate(
        validSeparatedLogicalModelMaster,
        'separated_logical_model',
      );
      expect(result.valid).toBe(true);
    });

    it('should validate separated_logical_model (fragment)', () => {
      const result = LogicalModelValidator.validate(
        validSeparatedLogicalModelFragment,
        'separated_logical_model',
      );
      expect(result.valid).toBe(true);
    });

    it('should validate logical_model_mapping', () => {
      const result = LogicalModelValidator.validate(
        validLogicalModelMapping,
        'logical_model_mapping',
      );
      expect(result.valid).toBe(true);
    });

    it('should return valid: false for an invalid schema', () => {
      const invalidLogicalModel = {
        schema_version: '1.0',
        model_name: 'TestModel',
        // Missing entities
      };
      const result = LogicalModelValidator.validate(
        invalidLogicalModel,
        'logical_model',
      );
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('validateFile', () => {
    it('should return valid: true for a valid file', () => {
      const filePath = 'valid.yaml';
      const fileContent = yaml.dump(validLogicalModel);

      vi.mocked(fs.readFileSync).mockReturnValue(fileContent);

      const result = LogicalModelValidator.validateFile(filePath);

      expect(fs.readFileSync).toHaveBeenCalledWith(filePath, 'utf-8');
      expect(result.valid).toBe(true);
      expect(result.data).toEqual(validLogicalModel);
    });

    it('should handle different model types in files', () => {
      const filePath = 'mapping.yaml';
      const fileContent = yaml.dump(validLogicalModelMapping);

      vi.mocked(fs.readFileSync).mockReturnValue(fileContent);

      const result = LogicalModelValidator.validateFile(
        filePath,
        'logical_model_mapping',
      );

      expect(result.valid).toBe(true);
      expect(result.data).toEqual(validLogicalModelMapping);
    });

    it('should handle file read errors', () => {
      const filePath = 'nonexistent.yaml';
      const error = new Error('File not found');

      vi.mocked(fs.readFileSync).mockImplementation(() => {
        throw error;
      });

      const result = LogicalModelValidator.validateFile(filePath);

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0].keyword).toBe('parse');
    });

    it('should handle yaml parse errors', () => {
      const filePath = 'malformed.yaml';
      const fileContent = 'invalid: yaml: content: [';

      vi.mocked(fs.readFileSync).mockReturnValue(fileContent);

      const result = LogicalModelValidator.validateFile(filePath);

      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0].keyword).toBe('parse');
    });
  });
});
