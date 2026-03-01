# @lms/core

論理データモデル（LMS）スイートのコアパッケージです。スキーマ定義、TypeScript型定義、およびバリデーターを提供します。

## 主な機能

- **論理モデルのバリデーション**: `LogicalModelValidator` を使用して、YAMLファイルやオブジェクトがLMSのスキーマ定義に従っているかを検証します。
- **型定義**: スキーマから自動生成されたTypeScriptの型定義を提供します。
- **スキーマ定義**: `logical_model`, `logical_model_with_context`, `separated_logical_model`, `logical_model_mapping` の JSON Schema を含みます。

## インストール

```bash
npm install @lms/core
```

## 使い方（バリデーションの例）

`LogicalModelValidator` を使って、論理モデルの検証を行うことができます。

```typescript
import { LogicalModelValidator } from "@lms/core";

// YAMLファイルからの直接検証
const result = LogicalModelValidator.validateFile("path/to/model.yaml");

if (result.valid) {
  console.log("✅ Valid model!");
  console.log(result.data); // パースされたデータ
} else {
  console.log("❌ Invalid model:", result.errors);
}

// オブジェクトの検証
const myModel = { /* ... */ };
const result2 = LogicalModelValidator.validate(myModel, "logical_model");
```

## サンプルコードの実行

このパッケージには、バリデーション機能の使い方を示すサンプルコードが含まれています。

```bash
cd packages/core
npm install
npm run example:basic
```

実行されるサンプルコードは `examples/basic-validation.ts` にあります。

## 開発

### スクリプト

- `npm run build`: TypeScript のビルド
- `npm run test`: テストの実行 (Vitest)
- `npm run generate:types`: スキーマから型定義を再生成
- `npm run example:basic`: 基本的なバリデーションのサンプルを実行
