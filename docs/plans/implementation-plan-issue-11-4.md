# `tools/lms_to_graphql` サンプルコード実装計画

## 1. 目的とスコープ

- **目的**: 開発者がCLIを経由せず、プログラム内から `tools/lms_to_graphql` のAPIを呼び出して、YAMLで定義された論理データモデルをGraphQL SDLに変換する方法を示す。
- **対象機能**:
- `js-yaml` を用いたYAMLファイルのパース。
- `Validator` クラスを用いた論理モデルの整合性チェック（存在しないエンティティへの参照チェックなど）。
- `convertLogicalModelToGraphQL` 関数を用いたGraphQL SDL文字列の生成。

- **スコープ**: リレーションシップが属性を持つ場合（Edge properties）の中間型生成や、リスト型へのマッピングが確認できるような例を含める。

## 2. ディレクトリ構成案

`tools/lms_to_graphql` 内に `examples` ディレクトリを作成します。

```text
tools/lms_to_graphql/
  ├── examples/
  │   ├── generate-graphql.ts        # 実装するサンプルコード本体
  │   └── data/
  │       └── graphql_sample.yaml    # サンプル用のYAMLファイル

```

## 3. 必要なサンプルデータの準備

GraphQLへの変換において特徴的な機能が確認できるデータモデルを用意します。

- **`graphql_sample.yaml`**:
- 基本的なエンティティと属性（主キーや必須項目の設定）。
- リレーションシップのカーディナリティ（`1:N` などによるリスト型の生成確認用）。
- **リレーションシップの属性**（Edge property: 例として `managed_by` に `assigned_at` 属性を持たせ、中間型が生成されることを確認）。

## 4. サンプルコード（`generate-graphql.ts`）の実装ステップ

以下のステップでTypeScriptのサンプルスクリプトを実装します（`src/index.ts` の処理の流れをプログラマブルに抽出します）。

**ステップ1: モジュールのインポート**
必要なファイル操作ライブラリと、ツールのバリデーター、コンバーターをインポートします。

```typescript
import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import { Validator } from "../src/validator.js";
import { convertLogicalModelToGraphQL } from "../src/converter.js";
import { LogicalModel } from "../src/types.js";
```

**ステップ2: YAMLファイルの読み込みとパース**
指定したパスからYAMLファイルを読み込み、JavaScriptオブジェクトに変換します。

```typescript
const inputFilePath = path.join(__dirname, "data", "graphql_sample.yaml");
console.log(`📂 論理モデルを読み込んでいます: ${inputFilePath}`);

const fileContents = fs.readFileSync(inputFilePath, "utf8");
const model = yaml.load(fileContents) as LogicalModel;
```

**ステップ3: モデルのバリデーション**
変換前に `Validator` を使ってスキーマと参照整合性のチェックを行います。

```typescript
console.log("🔍 バリデーションを実行中...");
const validator = new Validator();
const validationResult = validator.validate(model);

if (!validationResult.valid) {
  console.error("❌ バリデーションに失敗しました:");
  validationResult.errors.forEach((err) => console.error(`  - ${err}`));
  process.exit(1);
}
console.log("✅ バリデーション成功");
```

**ステップ4: GraphQL SDLへの変換**
バリデーションを通過したモデルを `convertLogicalModelToGraphQL` に渡し、GraphQLスキーマの文字列を生成します。

```typescript
console.log("🚀 GraphQL SDLを生成中...");
const graphqlSdl = convertLogicalModelToGraphQL(model);
```

**ステップ5: 結果の出力**
生成された文字列を `.graphql` ファイルとして保存します。

```typescript
const outputFilePath = path.join(__dirname, "data", "generated_schema.graphql");
fs.writeFileSync(outputFilePath, graphqlSdl);
console.log(`✨ 生成完了: ${outputFilePath} に保存されました。`);
```

## 5. 実行方法の整備

リポジトリの構成に従い、`ts-node` 等を使用した実行コマンドをREADMEのExamplesセクション等に追記します。

```bash
# 実行例
npx ts-node tools/lms_to_graphql/examples/generate-graphql.ts

```
