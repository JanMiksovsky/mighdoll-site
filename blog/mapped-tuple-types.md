## Mapped Tuple Types

<div class="diagram container">
  <div class="diagram lhs">
    <span class="line">
      <span class="type"        >T </span>
      <span class="punctutation">[</span>
      <span class="type"        >A</span>
      <span class="punctutation">,</span>
      <span class="type"        >B</span>
      <span class="punctutation">]</span>
    </span>
  </div>
  <div class="diagram rhs">
    <span class="line">
      <span class="type"        >T </span>
      <span class="punctutation">[</span>
      <span class="type"        >C</span>
      <span class="punctutation">,</span>
      <span class="type"        >D</span>
      <span class="punctutation">]</span>
    </span>
  </div>
  <div class="diagram arrow">
    <svg width="200" height="80" viewBox="0 0 200 80" fill="var(--arrow-color)" xmlns="http://www.w3.org/2000/svg">
      <path d="M150 10V30H75.5H1V50H75.5H150V70L200 40L150 10Z" stroke="black" stroke-width="1.5"/>
    </svg>
  </div>
</div>

There's a little trick for mapping over Tuple and Array types
that isn't mentioned in the main documentation for TypeScript
[Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html).

### Example

Let's try to convert an array of strings and numbers
to an array of objects with "str" and "num" fields.

We can convert the type of one element using a
[conditional type](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html).
If `T` is a string, the type constructor will return `{str: T}`,
and if `T` is a number, the type constructor will return `{num: T}`:

```ts
type Wrapped<T extends string | number> = T extends string
  ? { str: T }
  : T extends number
  ? { num: T }
  : T;
```

Here's how we might define a function that does the wrapping:

```ts
type TBD = "???";
type WrapElems<T> = TBD;
// ---cut---
function wrapEm<T extends (string | number)[]>(...args: T): WrapElems<T> {
  // ---cut-start---
  return null as any;
}
// ---cut-end---
```

Now, to define `WrapElems`..

### Solution with Mappped Types

Here's a `WrapElems` type constructor.
It maps one type of array or tuple to another type of array or tuple,
applying the `Wrapped` type conversion on each element.

```ts
type Wrapped<T extends string | number> = T extends string
  ? { str: T }
  : T extends number
  ? { num: T }
  : T;
// ---cut---
type WrapElems<T extends (string | number)[]> = {
  [key in keyof T]: Wrapped<T[key]>;
};
```

- `T` is an array, and so the
  [Mapped Type](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
  type `{ [key in keyof T]: Wrapped<T[key]> }` is also an array.
  It looks a little funny that you can make an array or tuple type with curly
  brace `{ }` notation, but it works.
  There is some documentation of this behavior in old TypeScript
  [release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-1.html).

The result type is an array of objects with "str" and "num" fields, as expected:

```ts
type Wrapped<T extends string | number> = T extends string
  ? { str: T }
  : T extends number
  ? { num: T }
  : T;
type WrapElems<T extends (string | number)[]> = {
  [key in keyof T]: Wrapped<T[key]>;
};
function wrapEm<T extends (string | number)[]>(...args: T): WrapElems<T> {
  return 0 as any;
}
// ---cut---
const w: [{ num: number }, { str: string }] = wrapEm(1, "foo");
```
