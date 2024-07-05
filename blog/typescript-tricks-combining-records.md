I needed to learn some TypeScript type system tricks
for a [library](https://npmjs.com/package/mini-parse) that lets users
combine Records, merge Records, manage arrays of Records, etc.
[@milomg](https://github.com/milomg) gave me some TypeScript tips
last week and
I thought I'd write them up and share them with you too.

Here's three tricks, roughly in order of increasing trickiness:

1. [Extending a Record Type Using a Mapped Type](#extending-a-record-type-using-a-mapped-type)
1. [Intersecting to Build Type Safe Records](#intersecting-to-build-type-safe-records)
1. [Recovering Record Types from Record Intersections](#recovering-record-types-from-record-intersections)

## Extending a Record Type Using a Mapped Type

<div class="diagram container">
  <div class="diagram lhs">
    <span class="line">
      <span class="type">T </span>
      <span class="punctutation">{</span>
      <span class="var"         >a</span>
      <span class="punctutation">:</span>
      <span class="number"      >1</span>
      <span class="punctutation">}</span>
    </span>
  </div>
  <div class="diagram rhs">
    <span class="line">
      <span class="type">T </span>
      <span class="punctutation">{</span>
      <span class="var"         >a</span>
      <span class="punctutation">:</span>
      <span class="number"      >1</span>
      <span class="punctutation">}, {</span>
      <span class="var"         >b</span>
      <span class="punctutation">:</span>
      <span class="number"      >2</span>
      <span class="punctutation">}</span>
    </span>
  </div>
  <div class="diagram desc">
    <span class="line">
      <span class="punctutation">.</span>
      <span class="function"    >add</span>
      <span class="punctutation">(</span>
      <span class="string"      >"b"</span>
      <span class="punctuation" >, </span>
      <span class="number"      >2</span>
      <span class="punctuation" >)</span>
    </span>
  </div>
  <div class="diagram arrow">
    <svg width="200" height="80" viewBox="0 0 200 80" fill="var(--arrow-color)" xmlns="http://www.w3.org/2000/svg">
      <path d="M150 10V30H75.5H1V50H75.5H150V70L200 40L150 10Z" stroke="black" stroke-width="1.5"/>
    </svg>
  </div>
</div>

Let's say you're collecting fields into a Record type
and you want to add a field.

Here's an example of adding a field to Record in a type safe way:

```ts
const x = { a: 1 };
type T = { a: "foo" } | { b: 2 };
// holds a set of tags, allows accumulating more tags
class Tags<N extends Record<string, any>> {
  // return a new Tags with the new tag added
  add<K extends string, V>(
    name: K,
    value: V
  ): Tags<N & { [key in K]: V }> //         ^^^^^^^^^^^^^^^^^^^
  // ---cut-start---
  {
    return 0 as any;
  }
  // ---cut-end---
  read(): N // ---cut-start---
  {
    return 0 as any;
  }
  // ---cut-end---
}
```

You can use `Tags` like as follows, and the result will be properly typed.

```ts
class Tags<N extends Record<string, any>> {
  // return a new Tags with the new tag added
  add<K extends string, V>(name: K, value: V):
    Tags<N & { [key in K]: V }> { return 0 as any; }
  read(): N  { return 0 as any; }
}
// ---cut---
const tags = new Tags().add("c", true);
const moreTags = tags.add("bar", "zap"); // add more fields
const record = moreTags.read(); // properly typed result
// @noErrors
record.
//     ^|

```

There are two Typescript tricks involved in the typing of `add`.

First, we need a way to define the record for the newly added field.
`{ [key in K]: V }` defines a mapped type, which maps over the fields
in K to create a new record type.
[Mapped type](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html)
syntax like this is usually seen mapping over a Record type,
but it turns out you can use it for a single string too.
The `[x in U]` part of the syntax maps over a union type,
typically created by the
[`keyof`](https://www.typescriptlang.org/docs/handbook/2/keyof-types.html#handbook-content)
type operator on a Record.
In this case `K` is always a single type
but that still qualifies as a (lonely) union.

Second, we need to combine the new record type with the existing record type.
Here we use a single intersection step,
combining the existing record type `N` with the new record type.
The resulting type `{c: boolean}` & `{bar: string}` is equivalent to
`{c: boolean; bar: string}`,
and so we've successfully extended our Record.

## Intersecting to Build Type Safe Records

<div class="diagram container">
  <div class="diagram lhs"> 
    <span class="line">
      <span class="type">T </span>
      <span class="punctutation">{</span>
      <span class="var"         >a</span>
      <span class="punctutation">:</span>
      <span class="number"      >1</span>
      <span class="punctutation">} | {</span>
      <span class="var"         >b</span>
      <span class="punctutation">:</span>
      <span class="number"      >2</span>
      <span class="punctutation">}</span>
    </span>
  </div>
  <div class="diagram rhs"> 
    <span class="line">
      <span class="type">T </span>
      <span class="punctutation">{</span>
      <span class="var"         >a</span>
      <span class="punctutation">:</span>
      <span class="number"      >1</span>
      <span class="punctutation">} & {</span>
      <span class="var"         >b</span>
      <span class="punctutation">:</span>
      <span class="number"      >2</span>
      <span class="punctutation">}</span>
    </span>
  </div>
  <div class="diagram arrow">
    <svg width="200" height="80" viewBox="0 0 200 80" fill="var(--arrow-color)" xmlns="http://www.w3.org/2000/svg">
      <path d="M150 10V30H75.5H1V50H75.5H150V70L200 40L150 10Z" stroke="black" stroke-width="1.5"/>
    </svg>
  </div>
</div>

Let's say we have two Record types `{a: string}` and `{b: number}`.
The type constructor below, `Intersection`, will combine
the two Record types like this: `{a: string} & {b: number}`, which
is almost the same as `{a: string; b: number}`.
(See
[Recovering Record Types](#recovering-record-types-from-record-intersections)
below.)

It's typical in type manipulation to find that we have a union type.
A union of the records above would give us
the choice of either type: `{a: string} | {b: number}`.
Sometimes we'd want the union.
But for combining into a single Record, we'd want the intersection.
If we have the two Record type parameters in hand,
easiest is to use the `&` operator to combine them.

But if we have an unspecified number of types, or a union type,
the following `Intersection` type constructor
becomes helpful for type safely constructing Records.

If you have a union type like `A | B | C`,
the `Intersection` type constructor will turn the union into
an intersection like `A & B & C`.

```ts
type Intersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;
```

The trick is described here in the
[TypeScript docs](https://www.typescriptlang.org/docs/handbook/advanced-types.html#type-inference-in-conditional-types)
and here on [Stack Overflow](https://stackoverflow.com/questions/50374908/transform-union-type-to-intersection-type).
The key move is to place the source type `U` into contravariant position
as a function parameter. Then when TypeScript infers the type
of the function parameter, it will be the intersection of the types in the union.

### Why Function Argument Types Intersect - Contravariance

Types in a programming language are intended to define what
programmers can use (type) safely.
What would be a type safe function to use where we expect
function with a single listed type? e.g. if we expect `(a:Insect) => number`,
what functions are ok to use?

Generally it'll be safe to use a function with an argument
can be a more general version of the argument.
If we have a function that takes an Insect and returns the number of legs,
we could type safely substitute a function that takes an Animal
and returns the number of legs.
The more general function will count legs on insects along with all
the other animals it handles.
So it'll be OK if our listed type (Insect)
`extends` our candidate type (Animal).

Function arguments are little unusual in the direction of the `extends` relationship.
Usually we'll expect that candidate types `extend` the listed type,
but function arguments are different,
so they're called _contra_-variant.

How does this contravariance apply to Records?
If we have a function that takes an argument of type: `{a:string} | {b:number}`,
we can type safely use an alternate function
that takes an argument of type: `{a:string, b:number}`.

If we have a function that takes an argument of type `A | B | C`,
we could type safely replace it with a function
that takes an argument of `A & B & C`.

### Intersection Uses a Contravariant Function Argument

So that's how `Intersection` works on a provided type `U`.
It invents a hypothetical function that uses `U` as a
function argument. Let's call the first function `f`.

Then `Intersection` asks TypeScript to imagine
a second function that `extends` the the first hypothetical function
with a function argument of type `I`.
Let's call the second function `g`.

So `f extends g` - we wrote it that way.
And due to contravariance of function argumnets,
`I extends U`.
We ask TypeScript to `infer` the type of `I`.

If U is a union type, voila, TypeScript produces
the intersection type. If U is a union of Records,
we end up with the intersection of Records, which is
usually close enough to be considered a single merged Record.

## Recovering Record Types from Record Intersections

<div class="diagram container">
  <div class="diagram lhs">
    <span class="line">
      <span class="type"        >?T </span>
      <span class="punctutation">{</span>
      <span class="var"         >a</span>
      <span class="punctutation">:</span>
      <span class="number"      >1</span>
      <span class="punctutation">} & {</span>
      <span class="var"         >b</span>
      <span class="punctutation">:</span>
      <span class="number"      >2</span>
      <span class="punctutation">}</span>
    </span>
  
  </div>
  <div class="diagram rhs"> 
    <span class="line">
      <span class="type"        >T </span>
      <span class="punctutation">{</span>
      <span class="var"         >a</span>
      <span class="punctutation">:</span>
      <span class="number"      >1</span>
      <span class="punctutation">, </span>
      <span class="var"         >b</span>
      <span class="punctutation">:</span>
      <span class="number"      >2</span>
      <span class="punctutation">}</span>
    </span>
  
  </div>
  <div class="diagram arrow">
    <svg width="200" height="80" viewBox="0 0 200 80" fill="var(--arrow-color)" xmlns="http://www.w3.org/2000/svg">
      <path d="M150 10V30H75.5H1V50H75.5H150V70L200 40L150 10Z" stroke="black" stroke-width="1.5"/>
    </svg>
  </div>
</div>

TypeScript sometimes has trouble inferring the type of a `Record` type parameter
after `Intersection`.
I'm not sure why, let me know if you know.

```ts
type ARecord = Record<any, any>;
type Verify<T extends ARecord> = T; // fail to typecheck if T is not a Record
```

`Intersection` typechecks sometimes:

```ts
type ARecord = Record<any, any>;
type Verify<T extends ARecord> = T; // fail to typecheck if T is not a Record
type Intersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;
// ---cut---
type SimpleIntersection<A extends ARecord, B extends ARecord> = Verify<A & B>;
type ConcreteIntersect = Verify<Intersection<{ a: 1 } | { b: 2 }>>;
```

But not always:

```ts
type ARecord = Record<any, any>;
type Verify<T extends ARecord> = T; // fail to typecheck if T is not a Record
type Intersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;
// ---cut---
// @errors: 2344
type ParamIntersect<A extends ARecord> = Verify<Intersection<A>>;
```

### Solution - Recover the Record Type

- _(Update July 2024): For a newer solution, see
  [Modern Intersection](https://mighdoll.dev/blog/modern-typescript-intersection)_

The following will help recover the Record type after `Intersection`.

For basic Record types, try this to conslidate the Record:

```ts
type AsRecord<T> = T extends Record<any, any>
  ? { [A in keyof T]: T[A] }
  : never;
```

For Records with array values, here's a variant:

```ts
type AsRecordArray<T> = T extends Record<any, any[]>
  ? { [A in keyof T]: T[A] }
  : never;
```

In both cases, deferring the Record type match until the extends clause
seems to help TypeScript recognize the intersection type as a viable Record.

And it works:

```ts
type ARecord = Record<any, any>;
type Verify<T extends ARecord> = T; // fail to typecheck if T is not a Record
type Intersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;
type AsRecord<T> = T extends Record<any, any>
  ? { [A in keyof T]: T[A] }
  : never;

// ---cut---
type ParamIntersect2<A extends ARecord> = Verify<AsRecord<Intersection<A>>>;

// success:
type Test1 = ParamIntersect2<{ a: 1 } | { b: 2 }>;
// type Test1 = { a: 1; b: 2; }
```
