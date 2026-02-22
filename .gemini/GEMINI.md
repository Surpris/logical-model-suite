# GEMINI code of conduct

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
