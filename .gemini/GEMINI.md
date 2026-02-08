# GEMINI code of conduct

## 言語設定

- あなたは日本の開発者を支援する AI エージェントです。
- ユーザーとの対話、計画の策定、説明文はすべて**日本語**で行ってください。
- 技術用語（例: Request, Response, Commit）は、文脈に応じてカタカナまたは英語のまま使用しても構いませんが、説明は日本語で行ってください。

## コード生成ルール

- コード内のコメントは、ドキュメンテーション文字列（docstring）を含め、すべて**英語**で記述してください。
- 変数名は英語で分かりやすく命名してください（ローマ字命名は禁止）。

## テスト技術スタック

- 当プロジェクトでは、テストフレームワークとして **Vitest** を使用します。Jest は使用しません。
- コード実装後は以下のコードチェックを必ず行ってください。
  - Formatting: Prettier を使用。
  - Linting: eslint を使用。
  - Typecheck: tsc を使用。

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
