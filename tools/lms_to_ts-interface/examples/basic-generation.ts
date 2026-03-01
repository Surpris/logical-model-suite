import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { generateTypeScript } from '../src/index.js';

// ESModulesで__dirnameをエミュレート
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ステップ2: YAMLファイルの読み込み
const inputFilePath = path.join(__dirname, 'data', 'sample_model.yaml');
if (!fs.existsSync(inputFilePath)) {
  console.error(`❌ ファイルが見つかりません: ${inputFilePath}`);
  process.exit(1);
}

const yamlContent = fs.readFileSync(inputFilePath, 'utf-8');
console.log(`📂 読み込み完了: ${inputFilePath}`);

// ステップ3: TypeScriptコードの生成
console.log('🚀 TypeScriptコードを生成中...');
try {
  const tsCode = generateTypeScript(yamlContent);

  // ステップ4: 生成されたコードの保存
  const outputFilePath = path.join(__dirname, 'data', 'sample_model_types.ts');
  fs.writeFileSync(outputFilePath, tsCode);
  console.log(`✅ 生成完了: ${outputFilePath} に保存されました。`);

  // (オプション) 生成されたコードの一部を表示
  console.log('\n--- 生成されたコード (冒頭) ---');
  console.log(tsCode.split('\n').slice(0, 15).join('\n'));
  console.log('------------------------------');
} catch (error) {
  console.error('❌ 生成中にエラーが発生しました:', error);
  process.exit(1);
}
