## Infer a Type Without Passing a Type Parameter

<div class="diagram container">
  <div class="diagram lhs">
    <span class="line">
      <span class="type"        >T</span>
      <span class="punctutation">&lt;</span>
      <span class="type"        >X</span>
      <span class="punctutation">&gt;</span>
    </span>
  </div>
  <div class="diagram rhs">
    <span class="line">
      <span class="type"        >T</span>
      <span class="punctutation">&lt;</span>
      <span class="type"        >A</span>
      <span class="punctutation">, </span>
      <span class="type"        >B</span>
      <span class="punctutation">, </span>
      <span class="type"        >C</span>
      <span class="punctutation">&gt;</span>
    </span>
  </div>
  <div class="diagram arrow">
    <svg width="200" height="80" viewBox="0 0 200 80" fill="var(--arrow-color)" xmlns="http://www.w3.org/2000/svg">
      <path d="M150 10V30H75.5H1V50H75.5H150V70L200 40L150 10Z" stroke="black" stroke-width="1.5"/>
    </svg>
  </div>
</div>

### Explicit type parameters are straightforward

Let's say you have a type that takes several type parameters.

```ts
interface ThreeParams<A, B, C> {
  a: A;
  b: B;
  c: C;
}
```

In typical cases, if you had a function taking a `ThreeParams` argument
you'd take three type parameters:

```ts
// ---cut-start---
interface ThreeParams<A, B, C> {
  a: A;
  b: B;
  c: C;
}
// ---cut-end---
function makeThree<A, B, C>(a: A, b: B, c: C): ThreeParams<A, B, C> {
  return { a, b, c };
}
```

TypeScript will usually fill in the type parameters to save work
for users of your api.

```ts
// ---cut-start---
interface ThreeParams<A, B, C> {
  a: A;
  b: B;
  c: C;
}
function makeThree<A, B, C>(a: A, b: B, c: C): ThreeParams<A, B, C> {
  return { a, b, c };
}
// ---cut-end---
const p = makeThree("foo", 1, true);
```

All good so far. Do that if it works.

### Explicit type parameters fail for more complicated cases

But what if there are a whole lot of repeated type parameters,
or a variable number of parameters?
Sometimes it's inconvenient or even impossible to write down type
type parameters for every relevant type.

```ts
// ---cut-start---
interface ThreeParams<A, B, C> {
  a: A;
  b: B;
  c: C;
}
// ---cut-end---

// at best it's tedious to write out many functions with lots of parameters
function manyParams<A, B, C, D, E, F, G, H, I>(
  a: ThreeParams<A, B, C>,
  b: ThreeParams<D, E, F>,
  c: ThreeParams<G, H, I>
): B { }

// and complicated cases like variable argument lists get tricky..
// @noErrors
function fooM<A,B,C, ???>(...args: ThreeParams<???, ???, ???>[]): ??? { }

```

### Solution: 'infer'

One way around these problems is to put a simpler, less parameterized type
on the api. Then we'll use 'infer' to magically pull out the types
we need even though they're not specified as type parameters. Here's an example:

Create a type that hides the parameters in the external api:

```ts
// ---cut-start---
interface ThreeParams<A, B, C> {
  a: A;
  b: B;
  c: C;
}
// ---cut-end---
type ABC = ThreeParams<any, any, any>;
```

And then we can use `infer` to figure out only the types we need on the inside.
We need a 'stage' for `infer` to work, so we introduce a conditional type.
The condition will always be true, and we'll always return the inferred type.
In this case, we're interested in the second type parameter.

```ts
// ---cut-start---
interface ThreeParams<A, B, C> {
  a: A;
  b: B;
  c: C;
}
type ABC = ThreeParams<any, any, any>;
// ---cut-end---
type InferB<T extends ABC> = T extends ThreeParams<any, infer B, any>
  ? B
  : never;
```

We'd use the new inferred type constructor like this:

```ts
// ---cut-start---
interface ThreeParams<A, B, C> {
  a: A;
  b: B;
  c: C;
}
type ABC = ThreeParams<any, any, any>;
type InferB<T extends ABC> = T extends ThreeParams<any, infer B, any>
  ? B
  : never;

// ---cut-end---
function fooB<T extends ABC>(a: T): InferB<T> {
  return a.b;
}
```

We've reduced the visible type parameters in the API here from three to one.
If there were more function parameters, multiple function overloads,
or more just type parameters, the simplification factor would be even greater.

`infer` in a type constructor can be handy in more complicated situations too.
Here's an example with variable numbers of arguments.
This example also uses the TypeScript
[typeof](https://www.typescriptlang.org/docs/handbook/2/typeof-types.html) operator,
which works to give you the type of a term as long as you're in a type context,
e.g. between angle brackets < >.
We can even index to pick out the type of the first argument of the args array.

```ts
// ---cut-start---
interface ThreeParams<A, B, C> {
  a: A;
  b: B;
  c: C;
}
type ABC = ThreeParams<any, any, any>;
type InferB<T extends ThreeParams<any, any, any>> = T extends ThreeParams<
  any,
  infer B,
  any
>
  ? B
  : never;

// ---cut-end---
/** return type is the second type parameter of the first argument */
function fooH<T extends ABC>(...args: T[]): InferB<(typeof args)[0]> {
  // ---cut-start---
  return 0 as any;
}
// ---cut-end---
```

By using `infer` we can keep things simple
on the side of the api that our caller uses,
and cleanly solve some complicated type problems on the inside.

#### Note: Still Need One Type Parameter

Could we have zero type parameters rather than one?
It would be nice to be simpler, but that doesn't work so well.
Here, TypesScript leaves the internal types as `any`:

```ts
interface ThreeParams<A, B, C> {
  a: A;
  b: B;
  c: C;
}
type ABC = ThreeParams<any, any, any>;
type InferB<T extends ABC> = T extends ThreeParams<any, infer B, any>
  ? B
  : never;
// ---cut---
// returns type any, not so helpful
function fooB_nope(a: ABC): InferB<typeof a> {
  // ---cut-start---
  return a.b;
}
// ---cut-end---
```

So we'll typically still need one type parameter:

```ts
interface ThreeParams<A, B, C> {
  a: A;
  b: B;
  c: C;
}
type ABC = ThreeParams<any, any, any>;
type InferB<T extends ThreeParams<any, any, any>> = T extends ThreeParams<
  any,
  infer B,
  any
>
  ? B
  : never;

// ---cut---
// return type is second type parameter of ThreeParams
function fooB<T extends ABC>(a: T): InferB<T> {
  //            ^^^^^^^^^^^^^
  // ---cut-start---
  return a.b;
}
// ---cut-end---
```
