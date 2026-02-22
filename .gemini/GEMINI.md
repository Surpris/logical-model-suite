# GEMINI code of conduct

## プロジェクト概要

このプロジェクトでは、論理データモデル（Logical Data Model: LMS）の定義、バリデーション、および各種スキーマへの変換を行うためのツールスイートを開発します。具体的には、データ構造を抽象化した「論理モデル」を核に、開発の効率化とデータ定義の一貫性を保つためのエコシステムを提供します。

- **論理モデルの定義**: YAML形式で記述され、JSON Schemaによって構造が制御されます。
- **マルチプラットフォーム展開**: 一つの論理モデルから、TypeScript, Prisma, GraphQL などの実装用スキーマを自動生成します。

## テスト技術スタック

- 当プロジェクトでは、テストフレームワークとして **Vitest** を使用します。Jest は使用しません。

## コーディング規約

- テストコードの提案を行う際は、必ず `import { describe, it, expect, vi } from 'vitest'` を使用してください。
- ファイル名は `*.test.ts` または `*.spec.ts` とします。
- モック化が必要な場合は `vi.fn()`, `vi.spyOn()` を使用してください（`jest.fn()`は不可）。

## 技術スタック概要

- 言語: TypeScript
- ビルドツール: Vite
- Backend: NestJS v11 (テストランナーは Vitest に置換すること。)
  - ORM: Prisma v6 or v5
  - DB: PostgreSQL
  - API: GraphQL (Apollo Server v5)
  - Auth/ID: UUID v7 (時系列ソート可能なUUID)
- Frontend: React v19
  - UI components: Material UI
