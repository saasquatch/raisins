# `@raisins/schema`

Schema for describing web component bundles and how they can be editted by Raisins.

## Usage

Import the JSON schema document

```js
import schema from "@raisins/schema";

myschemavalidator(input, schema);
```

Import the typescript types

```js
import * as schema from "@raisins/schema/schema";
type Foo = schema.Package;
```

Import specific types from the schema

```js
import { Attribute } from "@raisins/schema/schema";
type AttributeAtom = Atom<Attribute>;
```
