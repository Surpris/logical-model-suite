import path from 'path';
import { fileURLToPath } from 'url';
import { LogicalModelValidator } from '../src/index.js';

// Determine __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('--- 1. YAMLファイルからの直接検証 (正常系) ---');
const validFilePath = path.join(__dirname, 'data', 'valid_model.yaml');

// デフォルトは 'logical_model' 型の検証になります
const result1 = LogicalModelValidator.validateFile(
  validFilePath,
  'logical_model',
);

if (result1.valid) {
  console.log('✅ 検証成功: 正しい論理モデルです。');
  // console.log(JSON.stringify(result1.data, null, 2)); // パースされたデータへのアクセスも可能
} else {
  console.log('❌ 検証失敗 (想定外):', JSON.stringify(result1.errors, null, 2));
}

console.log('\n--- 2. YAMLファイルからの直接検証 (異常系) ---');
const invalidFilePath = path.join(__dirname, 'data', 'invalid_model.yaml');

const result2 = LogicalModelValidator.validateFile(
  invalidFilePath,
  'logical_model',
);

if (!result2.valid) {
  console.log('✅ 想定通り検証に失敗しました。');
  result2.errors?.forEach((err) => {
    console.log(`  - 箇所: ${err.instancePath} | エラー: ${err.message}`);
  });
} else {
  console.log(
    '❌ 検証成功 (想定外): 正しい論理モデルと判定されてしまいました。',
  );
}

console.log('\n--- 3. オブジェクトデータの検証 (異常系) ---');
// 意図的に必須項目が欠けた不正なデータを用意
const invalidData = {
  models: [
    {
      // nameが欠落しているなどのスキーマ違反
      description: 'Invalid model example',
    },
  ],
};

const result3 = LogicalModelValidator.validate(invalidData, 'logical_model');

if (!result3.valid) {
  console.log('✅ 想定通り検証に失敗しました。エラー内容は以下の通りです:');
  result3.errors?.forEach((err) => {
    console.log(`  - 箇所: ${err.instancePath} | エラー: ${err.message}`);
  });
} else {
  console.log(
    '❌ 検証成功 (想定外): 正しい論理モデルと判定されてしまいました。',
  );
}

console.log('\n--- 4. コンテキスト付きモデルの検証例 ---');
// 今回は valid_model.yaml を使い回しますが、本来は 'logical_model_with_context' 用のファイルを使います
// valid_model.yaml は logical_model_with_context としても（追加フィールドがなければ）有効かもしれません
const result4 = LogicalModelValidator.validateFile(
  validFilePath,
  'logical_model_with_context',
);

if (result4.valid) {
  console.log('✅ 検証成功: logical_model_with_context としても妥当です。');
} else {
  console.log('❌ 検証失敗:', JSON.stringify(result4.errors, null, 2));
}
