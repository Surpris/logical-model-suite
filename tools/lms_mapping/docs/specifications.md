# LMS Mapping Tool Specifications

## 1. 概要 (Overview)

本ツール `lms_mapping` は、異なる論理データモデル（Logical Data Model: LMS）間でのデータ変換を実現するためのツールキットです。
主に以下の2つの機能を提供します：

1. **マッピング定義の管理**: `logical_model_mapping_schema_definition.json` に準拠したマッピング定義ファイルの検証。
2. **データ変換エンジン**: マッピング定義に基づいて、ソースとなるLMSデータ（YAML）をターゲットとなるLMSデータ（YAML）に変換する。

## 2. 背景と目的 (Background & Goals)

LMSエコシステムでは、複数の異なるデータモデル（例: 大学のDMPモデルと政府の共通DMPモデル）が存在し得ます。これら相互のデータ流通を可能にするため、個別にプログラムを書くことなく、定義ファイル（Configuration）のみで変換ロジックを記述できる仕組みが必要です。

## 3. 技術スタック (Tech Stack)

- **言語**: TypeScript
- **ランタイム**: Node.js
- **推奨ライブラリ**:
  - YAML処理: `js-yaml`
  - スキーマ検証: `ajv`
  - CLIフレームワーク: `commander` または `cac`

## 4. 機能要件 (Functional Requirements)

### 4.1. マッピング定義機能 (Mapping Definition)

この機能は、ユーザーが作成したマッピング定義ファイルが正当であるかをチェックします。

- **スキーマ準拠**: `schema_definitions/logical_model_mapping/logical_model_mapping_schema_definition.json` を正としてバリデーションを行う。
- **検証項目**:
  - 必須フィールド (`mapping_id`, `source_model`, `target_model`, `entity_mappings`) の存在確認。
  - `entity_mappings` 内の各ルールがスキーマ定義に従っているか。
  - （将来構想）Source/TargetのLMSスキーマ定義と照らし合わせた、属性名やエンティティ名の存在チェック。

### 4.2. データ変換機能 (Data Converter)

Pythonによる参考実装 (`tools/lms_mapping/python/converter.py`) のロジックをベースに、TypeScriptで実装します。

- **入力**:
  - ソースデータファイル (YAML形式)
  - マッピング定義ファイル (YAML形式)
- **処理フロー**:
  1. **Load**: マッピング定義とソースデータを読み込む。
  2. **Index**: マッピング定義を `Context URI` または `Entity Name` をキーとして検索可能な状態にする。
  3. **Traverse & Transform**:
     - ソースデータのルートからエンティティを走査する。
     - 各エンティティに対して、対応するマッピングルールを特定する。
     - **属性変換 (Attribute Mapping)**:
       - `rule: "direct_copy"`: 値をコピー。
       - `rule: "static_value"`: 固定値をセット。
       - `rule: "map_values"`: `value_map` に基づき値を変換（例: "public" -> "Open"）。
       - `rule: "ignore"`: 対象外とする。
       - **ネスト構造への書き込み**: `target_path` (例: `metadata.created_at`) が指定されている場合、ターゲットオブジェクト内で自動的に階層構造を生成して値をセットする。
     - **リレーション処理 (Relationship Mapping)**:
       - 子要素（ネストされたオブジェクトや配列）に対して再帰的に変換処理を実行する。
       - **逆方向マッピング (Inverse Mapping)**: `direction: "inverse"` が指定されている場合、親エンティティへの参照を子エンティティ側に設定する処理を行う。
  4. **Output**: 変換結果をYAMLファイルとして出力する。

## 5. CLI インターフェース設計 (CLI Interface)

本ツールはCLIとして提供され、以下のコマンド体系を持つことを想定します。

```bash
# マッピング定義ファイルの検証
$ lms-map validate <mapping_file_path>

# データ変換の実行
$ lms-map convert <source_data_path> <mapping_file_path> [options]

# オプション例
# -o, --output <path>   出力ファイルパス（デフォルトは標準出力または source_converted.yaml）
# --verbose             詳細ログの出力
```

## 6. 実装上の考慮事項 (Implementation Details)

- **Context特定**:
  - Python版参考実装では、子要素のContext特定がハードコードされていた（例: `has_datasets` なら `Dataset` とみなす等）。
  - TypeScript版では、これを汎用化する必要がある。マッピング定義の `relationship_mappings` 情報を用いて、どのリレーションがどのエンティティ型に対応するかを判断するロジックを組み込むこと。
- **循環参照 (Circular References)**:
  - 双方向リレーション（親→子、子→親）を持つデータモデルの場合、単純な再帰やJSON/YAMLダンプ時に無限ループが発生する可能性がある。
  - 変換処理中に「処理済みオブジェクト」を追跡する、あるいは出力時にID参照形式（`$ref` 等）に変換するなどの対策を検討する。
