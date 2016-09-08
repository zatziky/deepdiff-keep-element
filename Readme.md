This library wraps [deep-diff](https://github.com/flitbit/diff)`#diff()`.
All the computed diffs are the same **except for array element edits**.
 
# Usage
Just like the usage with `deep-diff`:

```
const diff = require('deep-diff-keep-element').diff;

const objLeft = {...};
const objRight = {...};

const result = diff(objLeft, objRight);
```

# Installation

`npm install deep-diff-keep-element --save`

# Why does this utility exist?

First, it's a proposal that illustrates what we needed.

For our auditing system we needed to persist the whole array element 
and not just the difference.

The object difference for 

```
const objA = {array: [{a: 1}]};
const objB = {array: [{a: 2}]};
```

would look in the original [deep-diff](https://github.com/flitbit/diff) like:

```
[{
  kind: "E",
  lhs: 1,
  rhs: 2,
  path: ["array", 0, "a"]
}]
```

With this utility the result keeps the original and changed elements. It also has the `kind` as `A` and changes the structure a bit:

```
[{
   kind: "A",
   path: ["array", 0],
   item: {
       kind: "E",
       path: ["a"],
       elementLeft: {a: 1},
       elementRight: {a: 2},
       lhs: 1,
       rhs: 2
   }
}]
```

# Tests

1. `npm install`
2.  `npm test`