import { compileFromFile } from 'json-schema-to-typescript';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const schemaDir = path.resolve(__dirname, '../src/schemas');
const typesDir = path.resolve(__dirname, '../src/types');

if (!fs.existsSync(typesDir)) {
  fs.mkdirSync(typesDir, { recursive: true });
}

const schemas = [
  {
    input: 'logical_model/logical_model_schema_definition.json',
    output: 'logical_model.ts',
  },
  {
    input: 'logical_model/logical_model_with_context_schema_definition.json',
    output: 'logical_model_with_context.ts',
  },
  {
    input: 'logical_model/separated_logical_model_schema_definition.json',
    output: 'separated_logical_model.ts',
  },
  {
    input: 'logical_model_mapping/logical_model_mapping_schema_definition.json',
    output: 'logical_model_mapping.ts',
  },
];

async function generateTypes() {
  for (const schema of schemas) {
    const schemaPath = path.join(schemaDir, schema.input);
    const outputPath = path.join(typesDir, schema.output);

    console.log(`Generating types from ${schemaPath}...`);

    try {
      const ts = await compileFromFile(schemaPath, {
        cwd: path.dirname(schemaPath),
        style: {
          singleQuote: true,
          semi: true,
        },
      });

      fs.writeFileSync(outputPath, ts);
      console.log(`Types generated at ${outputPath}`);
    } catch (error) {
      console.error(`Error generating types for ${schema.input}:`, error);
      process.exit(1);
    }
  }
}

generateTypes();
