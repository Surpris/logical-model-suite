#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import { ModelValidator } from '../validator.js';

async function main() {
  const targetPath = process.argv[2] || '.';
  console.log(`🚀 Starting Validation Process...`);
  console.log(`📂 Target Path: "${targetPath}"`);

  let validator: ModelValidator;
  try {
    validator = new ModelValidator();
  } catch (e: unknown) {
    console.error(`❌ Validator Initialization Failed: ${(e as Error).message}`);
    process.exit(1);
  }

  let filesToValidate: string[] = [];
  try {
    const stats = fs.statSync(targetPath);
    if (stats.isDirectory()) {
      filesToValidate = fs
        .readdirSync(targetPath)
        .filter((file) => file.endsWith('.yaml') || file.endsWith('.yml'))
        .map((file) => path.join(targetPath, file));
      if (filesToValidate.length === 0) {
        console.warn(`⚠️  No YAML files found in directory: ${targetPath}`);
      }
    } else if (stats.isFile()) {
      filesToValidate = [targetPath];
    } else {
      console.error(
        `❌ Error: Path '${targetPath}' is valid but not a file or directory.`,
      );
      process.exit(1);
    }
  } catch (e: unknown) {
    console.error(`❌ Error accessing path '${targetPath}': ${(e as Error).message}`);
    process.exit(1);
  }

  console.log(`Target Files: ${filesToValidate.length} file(s)\n`);

  let errorCount = 0;
  for (const filePath of filesToValidate) {
    console.log(`Testing: ${filePath} ...`);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const result = validator.validate(content);

      if (result.valid) {
        console.log(`  ✅ OK\n`);
      } else {
        console.error(`  ❌ Failed:`);
        result.errors.forEach((err) => console.error(`     - ${err}`));
        console.log('');
        errorCount++;
      }
    } catch (e: unknown) {
      console.error(`  ❌ System Error: ${(e as Error).message}\n`);
      errorCount++;
    }
  }

  console.log('---------------------------------------------------');
  if (errorCount === 0) {
    console.log('🎉 All files passed validation successfully!');
  } else {
    console.error(`💀 Process finished with errors in ${errorCount} file(s).`);
    process.exit(1);
  }
}

main();
