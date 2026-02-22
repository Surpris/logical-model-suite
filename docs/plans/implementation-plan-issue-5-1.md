# Implementation Plan: Fix NodeNext Module Resolution Issues

`packages/core` の `tsconfig` を `NodeNext` に変更したことに伴い発生している、モジュール解決エラーおよびインポートエラーを修正します。

## 1. 現状の課題

- `NodeNext` 解決モードでは、相対パスによるインポートに `.js` 拡張子が必須となるが、一部のファイルで欠落している。
- `packages/core` の `package.json` に `exports` フィールドがないため、ESM モードの消費者（`tools` 側）からの解決が不安定。
- `packages/core` のビルド成果物（`dist`）に古い形式（拡張子なし）の型定義が残っている可能性がある。

## 2. 修正方針

1. **`packages/core` の設定強化**: `exports` フィールドの追加とビルドの再実行。
2. **`tools/lms_to_ts-interface` のインポート修正**: すべての相対インポートに `.js` を付与。
3. **他のツールへの波及確認**: `lms_to_prisma` 等も同様の設定（`NodeNext`）であれば修正を適用。

## 3. 具体的な作業手順

### Phase 1: `packages/core` の修正

1. **`packages/core/package.json` の更新**
   - `exports` フィールドを追加し、型定義と実装のパスを明示する。

   ```json
   "exports": {
     ".": {
       "types": "./dist/index.d.ts",
       "import": "./dist/index.js"
     }
   }
   ```

2. **ビルド成果物のクリーンアップと再構築**
   - `dist` ディレクトリを削除し、`tsc -b` で再ビルドを実行。
   - `dist/index.d.ts` 等の内容が、拡張子付きのインポート/エクスポートになっていることを確認。

### Phase 2: `tools/lms_to_ts-interface` の修正

1. **相対インポートの拡張子補完**
   - 以下のファイルのインポート文に `.js` 拡張子を追加。
     - `src/bin/lms-gen.ts` (`../generator` -> `../generator.js`)
     - `src/bin/lms-val.ts` (`../validator` -> `../validator.js`)
     - `src/index.ts` (`./types`, `./generator`, `./validator` -> `./types.js`, etc.)
2. **型エラーの解消**
   - `@lms/core` から `LogicalModelValidator` と `ErrorObject` が正しく認識されるか `tsc --noEmit` で確認。

### Phase 3: 他のツール（`lms_to_prisma` 等）の確認

1. **`tools/lms_to_prisma` の `tsconfig` 確認**
   - `NodeNext` を使用している場合は、同様に相対インポートの拡張子を確認・修正。

## 4. 検証項目

- [ ] `packages/core` がエラーなくビルドできること。
- [ ] `tools/lms_to_ts-interface` で `tsc --noEmit` を実行し、すべてのモジュール解決エラーが解消されていること。
- [ ] `npm run test` 等の既存のタスクが動作すること。
