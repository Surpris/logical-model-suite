import fs from "fs";
import yaml from "yaml";
import { LogicalModelValidator } from "@lms/core";
import { LogicalDataModelIntermediateRepresentationSchema } from "../types/logical_model.js";

export function loadLogicalModel(
  filePath: string,
): LogicalDataModelIntermediateRepresentationSchema {
  const fileContent = fs.readFileSync(filePath, "utf8");
  const parsed = yaml.parse(fileContent);

  const validationResult = LogicalModelValidator.validate(parsed);

  if (!validationResult.valid && validationResult.errors) {
    const errorMessages = validationResult.errors.map(err => `Path ${err.instancePath}: ${err.message}`).join('\n');
    throw new Error(`Validation failed:\n${errorMessages}`);
  }

  return parsed as LogicalDataModelIntermediateRepresentationSchema;
}
