# `tools/lms_to_ts-interface` サンプルコード実装計画

## 1. 目的とスコープ

- **目的**: 開発者が `tools/lms_to_ts-interface` の API (`generateTypeScript` など) をプログラムから直接呼び出し、YAMLファイルからTypeScriptインターフェースを生成する方法を理解できるようにする。
- **対象機能**:
- `generateTypeScript` 関数を使用したコード生成。
- ファイルの読み込みと、生成されたコードのファイル書き出し（基本的なI/O処理の例示）。

## 2. ディレクトリ構成案

`tools/lms_to_ts-interface` 内に `examples` ディレクトリを作成します。

```text
tools/lms_to_ts-interface/
  ├── examples/
  │   ├── basic-generation.ts      # 実装するサンプルコード本体
  │   └── data/
  │       └── sample_model.yaml    # サンプル用のYAMLファイル

```

## 3. 必要なサンプルデータの準備

READMEに記載されているような、エンティティ（User, Groupなど）とそれらのリレーションシップ（has_memberなど）を含む、分かりやすい `sample_model.yaml` を用意します。

## 4. サンプルコード（`basic-generation.ts`）の実装ステップ

以下のステップでTypeScriptのサンプルスクリプトを実装します。

**ステップ1: モジュールとファイル操作ライブラリのインポート**
`fs` モジュールによるファイル操作と、コアAPIである `generateTypeScript` をインポートします。

```typescript
import * as fs from "fs";
import * as path from "path";
import { generateTypeScript } from "../src/index.js"; // パスは適宜調整
```

**ステップ2: YAMLファイルの読み込み**
準備した `sample_model.yaml` を文字列として読み込む処理を記述します。

```typescript
const inputFilePath = path.join(__dirname, "data", "sample_model.yaml");
const yamlContent = fs.readFileSync(inputFilePath, "utf-8");
console.log(`📂 読み込み完了: ${inputFilePath}`);
```

**ステップ3: TypeScriptコードの生成**
`generateTypeScript` 関数にYAML文字列を渡し、TypeScriptのコード文字列を生成します。

```typescript
console.log("🚀 TypeScriptコードを生成中...");
const tsCode = generateTypeScript(yamlContent);
```

**ステップ4: 生成されたコードの出力（または保存）**
結果が分かりやすいように、標準出力に表示するか、ファイルとして保存する処理を記述します（ここではファイル保存の例とします）。

```typescript
const outputFilePath = path.join(__dirname, "data", "sample_model_types.ts");
fs.writeFileSync(outputFilePath, tsCode);
console.log(`✅ 生成完了: ${outputFilePath} に保存されました。`);
```

## 5. 実行方法の整備

ユーザーがこのサンプルを簡単に実行できるように、実行コマンドを案内します。リポジトリの構成に従い、`ts-node` 等を使用します。

```bash
# 実行例
npx ts-node tools/lms_to_ts-interface/examples/basic-generation.ts

```
