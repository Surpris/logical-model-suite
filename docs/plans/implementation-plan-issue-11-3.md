# `tools/lms_to_prisma` サンプルコード実装計画

## 1. 目的とスコープ

- **目的**: 開発者がCLIを使わず、プログラム内から `tools/lms_to_prisma` のコアクラス（`PrismaSchemaBuilder` 等）を呼び出し、YAMLファイルからPrismaスキーマ（`.prisma`）を動的に生成する方法を理解できるようにする。
- **対象機能**:
- `loadLogicalModel` を用いたYAMLの読み込みと自動バリデーション。
- `PrismaSchemaBuilder` を用いたコアスキーマの文字列生成。
- Prismaの必須ブロック（`generator`, `datasource`）や、固定テンプレートの結合方法の例示。

## 2. ディレクトリ構成案

`tools/lms_to_prisma` 内に `examples` ディレクトリを作成して配置します。

```text
tools/lms_to_prisma/
  ├── examples/
  │   ├── generate-prisma-schema.ts   # 実装するサンプルコード本体
  │   └── data/
  │       └── simple_model.yaml       # サンプル用のYAMLファイル

```

## 3. 必要なサンプルデータの準備

Prismaの機能（UUIDの付与、リレーションシップの解決など）が分かりやすいように、1対多のリレーションを含むシンプルなデータモデルを用意します。

- **`simple_model.yaml`**: `User` と `Post` エンティティを持ち、`User` が複数の `Post` を作成できる（1:N）関係を定義したYAMLモデル。

## 4. サンプルコード（`generate-prisma-schema.ts`）の実装ステップ

以下のステップでTypeScriptのサンプルスクリプトを実装します。

**ステップ1: モジュールのインポート**
ファイル操作と、ツールが提供するローダーおよびビルダーをインポートします。

```typescript
import * as fs from "node:fs";
import * as path from "node:path";
import { loadLogicalModel } from "../src/core/loader.js"; // パスは適宜調整
import { PrismaSchemaBuilder } from "../src/core/PrismaSchemaBuilder.js";
```

**ステップ2: YAMLモデルの読み込みと検証**
`loadLogicalModel` 関数を使用して、指定したパスのYAMLファイルを読み込みます。この関数内で `@lms/core` によるバリデーションも自動的に行われます。

```typescript
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
```

**ステップ3: コアスキーマ文字列の生成**
`PrismaSchemaBuilder` のインスタンスを作成し、読み込んだモデルを渡してPrismaモデルの定義部分を生成します。

```typescript
console.log("🚀 Prismaスキーマを生成中...");
const builder = new PrismaSchemaBuilder();
const prismaModelsSchema = builder.build(logicalModel);
```

**ステップ4: Prismaの必須構成要素（ヘッダ等）の結合**
生成されたのは `model` や `enum` のブロックのみなので、Prismaが動作するために必要な `generator` と `datasource` ブロックを追加します（CLIの `index.ts` と同様の処理です）。

```typescript
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
```

**ステップ5: 結果の出力**
生成された完全なスキーマ文字列をファイルに書き出します。

```typescript
const outputFilePath = path.join(__dirname, "data", "generated_schema.prisma");
fs.writeFileSync(outputFilePath, finalPrismaSchema);
console.log(`✅ 生成完了: ${outputFilePath} に保存されました。`);
```

## 5. 実行方法の整備

リポジトリの構成に従い、開発者がすぐに動作を確認できるコマンドを提供します。

```bash
# 実行例 (ts-nodeが設定されている場合)
npx ts-node tools/lms_to_prisma/examples/generate-prisma-schema.ts

```
