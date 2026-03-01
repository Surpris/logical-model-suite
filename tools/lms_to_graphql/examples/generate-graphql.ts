import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { fileURLToPath } from 'url';
import { Validator } from '../src/validator.js';
import { convertLogicalModelToGraphQL } from '../src/converter.js';
import { LogicalModel } from '../src/types.js';

// ESM で __dirname をシミュレート
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * プログラム内から Logical Model を GraphQL SDL に変換するサンプルコード。
 */
function runExample() {
  const inputFilePath = path.join(__dirname, 'data', 'graphql_sample.yaml');
  console.log(`📂 論理モデルを読み込んでいます: ${inputFilePath}`);

  if (!fs.existsSync(inputFilePath)) {
    console.error(`❌ ファイルが見つかりません: ${inputFilePath}`);
    process.exit(1);
  }

  // 1. YAML ファイルの読み込みとパース
  const fileContents = fs.readFileSync(inputFilePath, 'utf8');
  const model = yaml.load(fileContents) as LogicalModel;

  // 2. モデルのバリデーション
  console.log('🔍 バリデーションを実行中...');
  const validator = new Validator();
  const validationResult = validator.validate(model);

  if (!validationResult.valid) {
    console.error('❌ バリデーションに失敗しました:');
    validationResult.errors.forEach((err) => console.error(`  - ${err}`));
    process.exit(1);
  }
  console.log('✅ バリデーション成功');

  // 3. GraphQL SDL への変換
  console.log('🚀 GraphQL SDL を生成中...');
  const graphqlSdl = convertLogicalModelToGraphQL(model);

  // 4. 結果の出力
  const outputFilePath = path.join(
    __dirname,
    'data',
    'generated_schema.graphql',
  );
  fs.writeFileSync(outputFilePath, graphqlSdl);
  console.log(`✨ 生成完了: ${outputFilePath} に保存されました。`);

  console.log('\n--- 生成されたスキーマの抜粋 ---');
  console.log(graphqlSdl.split('\n').slice(0, 20).join('\n') + '\n...');
}

runExample();
