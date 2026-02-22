# Implementation Plan - Issue #5: Monorepo Refactoring & Core Package Extraction

## 1. 概要 (Overview)

現在のプロジェクト構成では、`tools/` 配下の各ツール（`lms_to_graphql`, `lms_to_prisma`, `lms_to_ts-interface`）が独立したプロジェクトとして管理されており、型定義やバリデーションロジックが重複・散逸しています。
本計画では、**npm workspaces** を利用した Monorepo 構成へ移行し、共通ロジックと型定義を `packages/core` として集約することで、保守性と一貫性を向上させます。

## 2. 現状の問題点 (Current Problems)

- **型定義の重複と不整合:** `types.ts` や `logical_model.ts` が各ツールで個別に定義されており、内容に差異がある（例: `lms_to_prisma` は自動生成、他は手書き）。
- **バリデーションロジックの散逸:** JSON Schema を用いたバリデーションが各ツールで個別に実装されている。
- **スキーマ管理の複雑さ:** `schema_definitions/` がルートにあるものの、各ツールからの参照方法が統一されていない。

## 3. 提案するアーキテクチャ (Proposed Architecture)

### 3.1 ディレクトリ構造

```text
/ (root)
  package.json (workspaces: ["packages/*", "tools/*"])
  packages/
    core/                  <-- 【新設】共通パッケージ (@lms/core)
      package.json
      tsconfig.json
      src/
        schemas/           <-- schema_definitions/ を移動
        types/             <-- schema から自動生成された型定義
        validator.ts       <-- 共通バリデーションロジック
        utils/             <-- 共通ユーティリティ (YAML ローダー等)
  tools/
    lms_to_graphql/        <-- 既存ツールを改修
      package.json (depends on @lms/core)
    lms_to_prisma/         <-- 既存ツールを改修
      package.json (depends on @lms/core)
    lms_to_ts-interface/   <-- 既存ツールを改修
      package.json (depends on @lms/core)
```

### 3.2 `@lms/core` の役割

- **Single Source of Truth:** JSON Schema を正とし、TypeScript 型定義を自動生成して提供します。
- **Shared Logic:** スキーマバリデーション (AJV)、YAML ファイルの読み込み・パース等の共通機能を提供します。

## 4. 実施ステップ (Implementation Steps)

### Phase 1: Monorepo セットアップ

1. ルートディレクトリに `package.json` を作成し、`workspaces` を設定します。

    ```json
    {
      "name": "logical-model-suite",
      "private": true,
      "workspaces": ["packages/*", "tools/*"]
    }
    ```

### Phase 2: Core パッケージの作成 (`packages/core`)

1. `packages/core` ディレクトリを作成し、初期化 (`npm init`)。
2. ルートの `schema_definitions/` を `packages/core/src/schemas/` へ移動。
3. `json-schema-to-typescript` を導入し、JSON Schema から型定義 (`src/types/logical_model.ts`) を生成するスクリプトを作成。
4. AJV を用いた共通バリデーションロジック (`src/validator.ts`) を実装。
5. ビルド設定 (TypeScript) を行い、他パッケージから利用可能にする。

### Phase 3: 既存ツールの改修

各ツール (`lms_to_graphql`, `lms_to_prisma`, `lms_to_ts-interface`) に対して以下を実施：

1. `package.json` の依存関係に `@lms/core` を追加。

    ```json
    "dependencies": {
      "@lms/core": "*"
    }
    ```

2. ローカルの型定義ファイル (`types.ts` 等) を削除し、`@lms/core` からの import に変更。
3. ローカルのバリデーションロジックを削除し、`@lms/core` のバリデータを利用するように変更。
4. テストを実行し、動作に影響がないことを確認。

### Phase 4: core パッケージのテストの実装

`packages/core` に必要なテストを以下の手順で実装する。

1. 必要なテスト項目を特定する。
2. テストコードを実装する。
3. テストがすべて通ることを確認する。テスト対象の機能の実装に問題がある場合、それらの問題を解消する。

### Phase 5: 他のツールのテスト実装、全体動作確認とクリーンアップ

これは [implementation-plan-issue-7.md](./implementation-plan-issue-7.md) にて扱う。

## 5. 期待される効果 (Expected Outcome)

- **保守性の向上:** スキーマ変更時は `packages/core` のみを更新すれば良く、全ツールに一貫して反映される。
- **型安全性の強化:** 自動生成された型定義を共通利用することで、ツール間のインターフェース不整合を防ぐ。
- **開発効率の向上:** 共通ロジックの再利用により、新規ツール追加時のボイラープレートコードを削減。
