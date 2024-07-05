# An Improved Intersection Type Constructor

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

In a previous [post][Combining-Records],
I discussed using the [Intersection] type constructor in TypeScript,
but noted that it sometimes [fails][Intersection-Fails].

[Intersection] was originally proposed by @jcalz
on [stack overflow][jcalz-intersection] in 2018.
But I recently learned of a nice improvement to [Intersection] from @gerrit0.
The improved version deserves wider circulation.

The improvement to `Intersection` takes advantage of a relatively new TypeScript feature,
introduced in TypeScript version 4.8,
which allows for an [extends refinement on infer clauses][infer extends].

## Intersection

The improved version of `Intersection` goes like this:

```ts
type Intersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I extends U
) => void
  ? //        ^^^^^^^^^^^^^^^^^
    I
  : never;
```

The key change is to `infer I extends U` instead of just `infer I`.
With that tiny change, TypeScript now keeps better track of the constraint on `I`.
And that fixes the [failure][Intersection-Fails]
described in the previous [post][combining-records].

### Original Intersection

Here's the original version to compare:

```ts
type Intersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? //        ^^^^^^^
    I
  : never;
```

## Which Fix For Intersection is Better?

In the previous [post][combining-records],
I showed a different solution
to repair the original Intersection,
by using [AsRecord].
The result type from the improved Intersection alone
is subtly different than the [AsRecord] approach.
Which approach is better?

[AsRecord] forces a true record type, e.g.:

```ts
type Intersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I extends U
) => void
  ? I
  : never;
// ---cut---
type AsRecord<T> = T extends Record<any, any>
  ? { [A in keyof T]: T[A] }
  : never;

type combined = AsRecord<Intersection<{ a: 1; b: 2 }>>;
//   ^?
```

Intersection alone returns an intersection type, e.g.:

```ts
type Intersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I extends U
) => void
  ? I
  : never;
// ---cut---
type combined = Intersection<{ a: 1 } | { b: 2 }>;
//   ^?
```

Getting a clean `Record` type looks nicer
than an intersection type,
but both should work equivalently.

But [AsRecord] requires that you know something
about shape of result.
That's a little more constraining for general use.
Firstly, [AsRecord] demands that the result
you want is indeed a `Record`,
which is not the only intersection of types you might want.
And secondly, even for `Record`s you may
need different variations of [AsRecord]
for different record shapes,
e.g. [AsRecordArray][AsRecord].

So for simplicity and generality,
I plan to use the new [Intersection][NewIntersection] type alone.
But if I want to present a cleaner result type,
or if I discover a case where TypeScript
notices the difference between a `Record` and an intersection
of `Record`s,
I'll use both the new [Intersection][NewIntersection] and [AsRecord] together.

Here's a TypeScript [Playground link]
where you can play with these `Intersection` type variations in action.

[Combining-Records]: https://mighdoll.dev/blog/typescript-tricks-combining-records
[Intersection]: https://mighdoll.dev/blog/typescript-tricks-combining-records/#intersecting-to-build-type-safe-records
[AsRecord]: https://mighdoll.dev/blog/typescript-tricks-combining-records/#solution---recover-the-record-type
[Intersection-Fails]: https://mighdoll.dev/blog/typescript-tricks-combining-records/#recovering-record-types-from-record-intersections
[Playground link]: https://www.typescriptlang.org/play/?#code/C4TwDgpgBAggShAxgewE4BMoF4oJRgHgEMA7EAGilJAD4BuAKFEigDUJUBLAMxAIBUoEAB7AIJdAGdYeNOhrYo-OlCgB6NVG5FOAGyjBkB8EgAWSANZQeS69JLJgVXEjlMTUAJIkxqSUmBOZBICAFUFHAZVVQAKUKFRcSkqMigAfigo6NiLAC4oUIBKbAUAN2ROTHySCFKOYpExCWks7Ji86xJuDi9irDKKzAzWryhq2o5GBg0DU05pAHc0C0l3FgBhYMRUCDFvX39EJxx2Ll4CfY5DwOCCAG8qfIBGAF8oAB8oB4AjfIAmF40egMaaaYBzaToZAQSQkADkTiWqAsADooDEAOqmEBpQqgqAAAQ4qDQ0j+AGYACyUtbQAAKRFQRAAtpc-AECDAEk1kvBXBgImwODw+GzrkEQjAgSoQTM4Zwuj1PNyktJQnCtJxhDDrMBaV4fFcAhKMZxwQBRRLNMKCkZxFXNFIgdKZbI5fJFEpQcqVMZQGp1VANK3JEbuzrdVCjRqqgp9Aa+4bZZXjQOMZj0xkssUBP6ch282QCxSnEUXQ3so4ms2mS08ySc6WZDNKGHAP6KBlM1kV655h5EZ5vT4-f6AmUzaIAPTSIPxcJgkiL6A18xSjnMUbAyEkkk43100G4Wv1i+XAltqkEMcd5+olGoCgyDwA2lyFVALBAQMhuEoALr5Pwb7-lAbyppMIItl22a9gE5L5jehb8vIJbCucZ4oeWBzGrcUpNjMDhCKgJKoPq-BtuSnZZj2OFHAhA5Dh8XxQL8UAAvQmSTqoM4MEAA
[jcalz-intersection]: https://stackoverflow.com/questions/50374908/transform-union-type-to-intersection-type#answer-50375286
[infer extends]: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-8.html#improved-inference-for-infer-types-in-template-string-types
[NewIntersection]: #intersection
