import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { loadLogicalModel } from "../src/core/loader.js";
import { PrismaSchemaBuilder } from "../src/core/PrismaSchemaBuilder.js";

// __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. YAMLモデルの読み込みと検証
const inputFilePath = path.join(__dirname, "data", "simple_model.yaml");
console.log(`📂 論理モデルを読み込んでいます: ${inputFilePath}`);

let logicalModel;
try {
  // 読み込みとスキーマ検証を同時に実行
  logicalModel = loadLogicalModel(inputFilePath);
} catch (error) {
  console.error("❌ モデルの読み込みまたは検証に失敗しました:", error);
  process.exit(1);
}

// 2. コアスキーマ文字列の生成
console.log("🚀 Prismaスキーマを生成中...");
const builder = new PrismaSchemaBuilder();
const prismaModelsSchema = builder.build(logicalModel);

// 3. Prismaの必須構成要素（ヘッダ等）の結合
const finalPrismaSchema = [
  "// --- 自動生成されたPrismaスキーマ ---",
  "",
  "generator client {",
  '  provider = "prisma-client-js"',
  "}",
  "",
  "datasource db {",
  '  provider = "postgresql"',
  '  url      = env("DATABASE_URL")', // サンプルとして環境変数を利用する形に
  "}",
  "",
  prismaModelsSchema, // Builderで生成したモデル定義を展開
  "",
  "// --- ここに独自の追加モデルやテンプレートを結合することも可能です ---",
].join("\n");

// 4. 結果の出力
const outputFilePath = path.join(__dirname, "data", "generated_schema.prisma");
fs.writeFileSync(outputFilePath, finalPrismaSchema);
console.log(`✅ 生成完了: ${outputFilePath} に保存されました。`);
