# `tools/lms_mapping` (TypeScript版) 実装計画

## 1. プロジェクトの目的と技術スタック

異なる論理データモデル間でデータインスタンスを変換するツールを構築します。

- **言語/環境**: TypeScript, Node.js
- **主要ライブラリ**: `commander` (CLIフレームワーク), `js-yaml` (YAML処理), `ajv` (JSON Schemaバリデーション)

## 2. ディレクトリ構成案

CLIのエントリーポイントと、コアロジック（バリデーション、変換エンジン）を分離した構成にします。

```text
tools/lms_mapping/
  ├── package.json
  ├── tsconfig.json
  ├── src/
  │   ├── bin/
  │   │   └── lms-map.ts           # CLIのエントリーポイント
  │   ├── core/
  │   │   ├── validator.ts         # マッピング定義の検証ロジック
  │   │   └── engine.ts            # データ変換エンジン（Python版の移植）
  │   ├── types/
  │   │   └── index.ts             # 型定義（マッピング定義や変換ルールのインターフェース）
  │   └── utils/
  │       └── file-io.ts           # YAML/JSONの読み書き補助

```

## 3. 実装ステップ

### ステップ1: 型定義とプロジェクトのセットアップ

- `package.json` を作成し、必要なパッケージ（`js-yaml`, `ajv`, `commander` 等）をインストールします。
- マッピング定義の型（`EntityMapping`, `AttributeMapping`, `RelationshipMapping` など）を定義します（可能であれば `packages/core` で生成した型を再利用します）。

### ステップ2: マッピング定義のバリデーション機能実装 (`src/core/validator.ts`)

- `ajv` を使用し、入力されたマッピング定義（YAMLファイル）が `logical_model_mapping_schema_definition.json` に準拠しているかを検証するクラスを作成します。
- 必須フィールド（`mapping_id`, `source_model`, `target_model`, `entity_mappings`）や各ルールの整合性をチェックします。

### ステップ3: データ変換エンジンの実装 (`src/core/engine.ts`)

Python版 `DataTransformationEngine` のロジックをTypeScriptに移植しつつ、仕様書に挙げられた課題を解決します。

- **属性マッピング (`applyAttributeMapping`)**:
  - `direct_copy`, `static_value`, `map_values`, `ignore` のルールを実装します。
  - ネスト構造への値のセット（`target_path` に応じてオブジェクトの階層を動的に生成して代入する処理）を実装します。
- **リレーションと逆参照マッピング (`processEntity`)**:
  - エンティティを再帰的に変換する処理を実装します。
  - `direction: "inverse"` の場合、親エンティティへの参照を子エンティティ側に設定するロジックを実装します。
- **【重要】Contextの動的特定（Python版からの改善）**:
  - Python版では `has_datasets` なら `http://schema.org/Dataset` とハードコードされていました。
  - TS版では、マッピング定義の `relationship_mappings` 情報を参照し、どのリレーションがどのターゲットエンティティ（Context）に対応するかを動的に判定・抽出するロジックを実装します。

### ステップ4: 循環参照の解決と出力処理

- 親子の逆参照（inverse）によって生じる循環参照をそのまま出力（`JSON.stringify` や `yaml.dump`）しようとするとエラーになります。
- Python版では `clean_for_print` で `[Ref to ...]` に置換していました。TS版でも、出力前に循環参照を検知して `$ref: <id>` のような文字列に変換するか、シリアライザのオプションで循環参照を制御する処理を実装します。

**ステップ5: CLIインターフェースの構築 (`src/bin/lms-map.ts`)**
`commander` を用いて、仕様書通りのコマンドを定義します。

- **`lms-map validate <mapping_file_path>`**: ステップ2のバリデーターを呼び出し、結果を出力します。
- **`lms-map convert <source_data_path> <mapping_file_path> [options]`**:
  - `-o, --output` オプションで出力先を指定可能にします。
  - ステップ3のエンジンを実行し、変換結果をYAMLとしてファイルに出力します。

## 4. サンプルコードによる動作確認

実装完了後、`samples/jsps_dmp` にある `logical_model.yaml` と `jsps-dmp_to_cao_mapping.yaml` を入力として `convert` コマンドを実行し、正しく変換できることをテストします（Python版の `mock_dmp_data` を使用した出力結果と突合します）。
