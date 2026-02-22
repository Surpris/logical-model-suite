# lms-to-graphql 仕様書

## 1. 概要

`lms-to-graphql` は、YAML形式で定義された論理データモデル（Logical Data Model）を読み込み、GraphQL Schema Definition Language (SDL) に変換するコマンドラインツールです。
このツールは、論理モデルの定義に基づき、型（Type）、フィールド（Field）、およびリレーションシップ（Relationship）を GraphQL の文法に従って自動生成します。

## 2. システム構成

本ツールは以下の主要コンポーネントで構成されています。

- **CLI Entrypoint (`src/index.ts`)**: コマンドライン引数の解析、ファイルの入出力制御を行います。
- **Converter (`src/converter.ts`)**: 論理モデルオブジェクトを GraphQL SDL 文字列に変換するコアロジックです。
- **Validator (`src/validator.ts`)**: 入力された論理モデルの構造的妥当性と整合性を検証します。
- **Type Definitions (`src/types.ts`)**: 論理モデルの内部データ構造（TypeScript インターフェース）を定義します。

## 3. 入力データモデル

入力ファイルは YAML 形式で記述され、以下の構造を持つ必要があります（`src/types.ts` 準拠）。

| フィールド       | 型                  | 説明                                           |
| :--------------- | :------------------ | :--------------------------------------------- |
| `schema_version` | String              | スキーマのバージョン。                         |
| `model_name`     | String              | モデルの名称。                                 |
| `description`    | String?             | モデルの全体的な説明。                         |
| `entities`       | Map<String, Entity> | エンティティ定義の集合。キーはエンティティ名。 |

### 3.1 エンティティ (Entity)

| フィールド      | 型                         | 説明                                               |
| :-------------- | :------------------------- | :------------------------------------------------- |
| `description`   | String                     | エンティティの説明。Docstring として出力されます。 |
| `attributes`    | Map<String, Attribute>     | 属性の定義。                                       |
| `relationships` | Map<String, Relationship>? | リレーションシップの定義。                         |

### 3.2 属性 (Attribute)

| フィールド    | 型       | 説明                                               |
| :------------ | :------- | :------------------------------------------------- |
| `type`        | Enum     | データ型（後述の型マッピング参照）。               |
| `description` | String   | 属性の説明。                                       |
| `required`    | Boolean? | `true` の場合、Non-null (`!`) 制約が付与されます。 |
| `primary_key` | Boolean? | `true` の場合、`ID!` 型として扱われます。          |

### 3.3 リレーションシップ (Relationship)

| フィールド    | 型                      | 説明                                                                                      |
| :------------ | :---------------------- | :---------------------------------------------------------------------------------------- |
| `target`      | String                  | 関連先のエンティティ名。                                                                  |
| `cardinality` | Enum                    | `1:1`, `1:N`, `0:1`, `0:N`, `N:M` のいずれか。                                            |
| `attributes`  | Map<String, Attribute>? | リレーションシップ自体が持つ属性（Edge Attributes）。存在する場合、中間型が生成されます。 |

## 4. 変換ロジック

### 4.1 型マッピング (Scalar Types)

論理モデルのデータ型は、以下のように GraphQL スカラ型にマッピングされます。

| Logical Type | GraphQL Type |
| :----------- | :----------- |
| `String`     | `String`     |
| `Integer`    | `Int`        |
| `Float`      | `Float`      |
| `Boolean`    | `Boolean`    |
| `Date`       | `String`     |
| `DateTime`   | `String`     |
| `Text`       | `String`     |
| `Enum`       | `String`     |
| その他       | `String`     |

**特記事項:**

- `primary_key: true` が指定された属性は、元の型に関わらず `ID` 型に変換されます。
- `required: true` または `primary_key: true` の場合、型に `!` が付与されます（例: `String!`）。

### 4.2 エンティティ変換

各エンティティは GraphQL の `type` 定義に変換されます。

- `description` は `"""..."""` で囲まれたブロックコメントとして出力されます。
- `attributes` は各フィールドに変換されます。

**Query の生成:**
エンティティ内に `primary_key: true` の属性が存在する場合、トップレベルの `type Query` に以下のフィールドが自動追加されます。

```graphql
fieldName(id: ID!): EntityName
```

※ `fieldName` はエンティティ名の先頭を小文字にしたものになります。

### 4.3 リレーションシップ変換

#### 4.3.1 基本ルール

リレーションシップはエンティティ内のフィールドとして定義されます。

- **カーディナリティによるリスト化**:
  - `..:N` または `N:M` の場合、型はリスト `[...]` で囲まれます。
  - 例: `target: "User"`, `cardinality: "1:N"` -> `users: [User]`

- **必須制約**:
  - カーディナリティが `1:...` で始まる場合、フィールド自体が必須 (`!`) となります。
  - 例: `cardinality: "1:1"` -> `user: User!`

#### 4.3.2 属性付きリレーションシップ（中間型）

リレーションシップに `attributes` が定義されている場合、直接ターゲットエンティティを参照せず、自動生成された中間型を参照します。

- **中間型名**: `{EntityName}{RelationshipName capitalized}` （例: `UserAssignedProject`）
- **中間型構造**:

  ```graphql
  type UserAssignedProject {
    target: Project!  # 本来のターゲットへの参照
    assignedAt: String # リレーション属性
    ...
  }
  ```

- **参照フィールド**:
  元のエンティティからは、この中間型を参照します。

  ```graphql
  type User {
    assignedProjects: [UserAssignedProject]
  }
  ```

## 5. バリデーション

変換処理の前に、`Validator` クラスによる以下の検証が実行されます。

1. **JSON Schema Validation**:
   - `ajv` ライブラリを使用し、定義された JSON Schema に従っているか構造をチェックします。
   - 必須フィールドの欠如や型不一致を検出します。

2. **参照整合性チェック (Referential Integrity)**:
   - リレーションシップの `target` で指定されたエンティティ名が、実際にモデル内に存在するかを確認します。
   - 存在しないエンティティへの参照はエラーとなります。

## 6. CLI インターフェース

### コマンド

```bash
npm start -- <input_file> [options]
```

### 引数

- `<input_file>`: 変換対象の YAML ファイルパス（必須）。

### オプション

- `-o, --output <dir>`: 出力先ディレクトリ。指定がない場合は入力ファイルと同じディレクトリに出力されます。

## 7. エラーハンドリング

バリデーションエラーやファイル読み込みエラーが発生した場合、エラーメッセージを標準エラー出力（stderr）に表示し、プロセスは非ゼロの終了コードで終了します。
