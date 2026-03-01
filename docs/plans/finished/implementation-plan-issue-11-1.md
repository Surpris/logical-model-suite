# `packages/core` サンプルコード実装計画

## 1. 目的とスコープ

- **目的**: 開発者やユーザーが `packages/core` モジュールの `LogicalModelValidator` を使って、論理データモデルの検証を行う方法を直感的に理解できるようにする。
- **対象機能**:
- `LogicalModelValidator.validateFile()` を使用したYAMLファイルの直接検証。
- `LogicalModelValidator.validate()` を使用したオブジェクト（メモリ上のデータ）の検証。
- 正常系（Valid）と異常系（Invalid）のハンドリング方法の提示。

- **対応モデル**: `logical_model`, `logical_model_with_context`, `separated_logical_model`, `logical_model_mapping` の検証方法を示す。

## 2. ディレクトリ構成案

リポジトリのルート、または `packages/core` 内に `examples` ディレクトリを作成して配置する想定です。

```text
packages/core/
  ├── examples/
  │   ├── basic-validation.ts      # 実装するサンプルコード本体
  │   └── data/
  │       ├── valid_model.yaml     # 正常な論理データモデルのサンプル
  │       └── invalid_model.yaml   # スキーマ違反を含む論理データモデルのサンプル

```

## 3. 必要なサンプルデータの準備

サンプルコードを動かすために、意図的に「正しいYAML」と「エラーになるYAML」を用意します。

- **`valid_model.yaml`**: スキーマ定義を満たす最小限の論理データモデル。
- **`invalid_model.yaml`**: 必須項目が欠けている、または型が間違っているデータモデル。（例：エンティティ名がない、プロパティの型が不正など）。

## 4. サンプルコード（`basic-validation.ts`）の実装ステップ

以下のステップでTypeScriptのサンプルコードを実装します。

**ステップ1: モジュールのインポート**
`packages/core` のエントリーポイント（`index.ts`）からバリデーターを読み込みます。

```typescript
import { LogicalModelValidator } from "../src/index.js"; // パスは配置場所に応じて調整
```

**ステップ2: ファイルからの直接検証（`validateFile`の利用）**
ファイルパスを渡して直接検証するシンプルな方法を実装します。戻り値から `valid` フラグと `data` （パースされたオブジェクト）を取得して表示します。

```typescript
console.log("--- 1. YAMLファイルからの直接検証 ---");
const validFilePath = "./data/valid_model.yaml";

// デフォルトは 'logical_model' 型の検証になります
const result1 = LogicalModelValidator.validateFile(
  validFilePath,
  "logical_model",
);

if (result1.valid) {
  console.log("✅ 検証成功: 正しい論理モデルです。");
  // console.log(result1.data); // パースされたデータへのアクセスも可能
} else {
  console.log("❌ 検証失敗:", result1.errors);
}
```

**ステップ3: メモリ上のオブジェクト検証（`validate`の利用）とエラーハンドリング**
APIから受け取ったデータや、独自にパースしたデータを検証するケースを想定し、不正なデータを渡した場合のエラーオブジェクト（`ErrorObject[]`）の出力例を示します。

```typescript
console.log("\n--- 2. オブジェクトデータの検証（異常系の確認） ---");
// 意図的に必須項目が欠けた不正なデータを用意
const invalidData = {
  models: [
    {
      // nameが欠落しているなどのスキーマ違反
      description: "Invalid model example",
    },
  ],
};

const result2 = LogicalModelValidator.validate(invalidData, "logical_model");

if (!result2.valid) {
  console.log("❌ 想定通り検証に失敗しました。エラー内容は以下の通りです:");
  result2.errors?.forEach((err) => {
    console.log(`  - 箇所: ${err.instancePath} | エラー: ${err.message}`);
  });
}
```

**ステップ4: その他のモデルタイプの検証例**
`logical_model_with_context` など、他のモデルタイプの検証方法も明記します。

```typescript
console.log("\n--- 3. コンテキスト付きモデルの検証 ---");
const contextFilePath = "./data/valid_model.yaml"; // 仮のデータ
const result3 = LogicalModelValidator.validateFile(
  contextFilePath,
  "logical_model_with_context",
);
// ... 以下同様に結果をハンドリング
```

## 5. 実行方法の整備

ユーザーが簡単に試せるように、`package.json` に実行用のスクリプトを追加するか、`tsx` や `ts-node` などのツールを用いた実行コマンドをREADMEに追記します。

```bash
# 実行例 (tsxを使用する場合)
npx tsx packages/core/examples/basic-validation.ts

```
