# Logical Model Suite

論理データモデル（Logical Data Model: LMS）の定義、バリデーション、および各種スキーマへの変換を行うためのツールスイートです。

## Project status

現在、このプロジェクトは初期ファイルが追加された状態です。今後それらを統合・整理することが計画されています。

## 概要

このプロジェクトは、データ構造を抽象化した「論理モデル」を核に、開発の効率化とデータ定義の一貫性を保つためのエコシステムを提供します。

- **論理モデルの定義**: YAML形式で記述され、JSON Schemaによって構造が制御されます。
- **マルチプラットフォーム展開**: 一つの論理モデルから、TypeScript, Prisma, GraphQL などの実装用スキーマを自動生成します。

## プロジェクト構成

リポジトリは以下の構造で構成されています。

- `schema_definitions/`: 論理モデル自体の構造を定義する JSON Schema。
- `tools/`: 各種変換ツール。
  - `lms_to_prisma`: 論理モデルから Prisma スキーマ（`.prisma`）を生成。
  - `lms_to_ts-interface`: 論理モデルから TypeScript のインターフェース定義を生成。
  - `lms_to_graphql`: 論理モデルから GraphQL スキーマを生成。
  - `lms_mapping`: モデル間の変換やマッピングを行う Python ツール。
- `samples/`: モデル定義の具体例（JSPS DMP、CAOメタデータなど）。

## 主要な技術スタック

- **言語**: TypeScript, Node.js, Python
- **バリデーション**: AJV (JSON Schema Validator)
- **テスト**: Vitest
- **形式**: YAML, JSON Schema

## 開発ガイドライン

各ツールのディレクトリ（`tools/*`）に移動し、標準的な `npm` コマンドを使用して開発を行います。

### コマンド例（lms_to_prisma の場合）

```bash
cd tools/lms_to_prisma
npm install
npm run test        # テスト実行
npm run typecheck   # 型チェックとリンター実行
npm run generate:schema # スキーマ生成の実行
```

詳細は各ツールの `README.md` を参照してください。

## ライセンス

[LICENSE](LICENSE) ファイルを参照してください。
