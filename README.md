# fn-arg-names [![NPM version][npm-image]][npm-url]

Get any arguments from any function.

# Description

This module will help you extract absolutely all valid arguments from functions and pass them to you as an array. 

# Table of Contents

* [Install](#install)
* [Usage](#usage)
* [API](#api)
* [Contacts](#contacts)

<div id='install'></div>

# Install

```bash
$ npm install fn-arg-names
```

<div id='usage'></div>

# Usage

```javascript

const fnArgNames = require("fn-arg-names");

const result = fnArgNames("async function * a({a, b, c: d}, r = function(a,b) { return (a + b) }, {t = {}}, [e, f, [g, h], {i}, [j, {k}, [l, m, n]], ...args], o, /*p,*/ ...q){}");

console.log(result);

const simple = fnArgNames(function(a, b, c = (1 + 2 + 3), ...d) {});

console.log(simple);

```

```bash

[
  [ 'a', 'b', 'c', origin: 'object' ],
  'r',
  [ 't', origin: 'object' ],
  [
    'e',
    'f',
    [ 'g', 'h', origin: 'array' ],
    [ 'i', origin: 'object' ],
    [ 'j', [Array], [Array], origin: 'array' ],
    '...args',
    origin: 'array'
  ],
  'o',
  '...q'
]

[ 'a', 'b', 'c', '...d' ]

```

<div id='api'></div>

# API

Types: [HERE!](https://github.com/StormExecute/fn-arg-names/blob/master/index.d.ts)

### fnArgNames(fn: string | Function) => answer
The main function.

### fnArgNames.default(fn: string | Function) => answer
The same as fnArgNames.

### fnArgNames.strict(fn: string | Function) => answer
The same as fnArgNames, but in case of syntax errors in string function will return a detailed analysis of the error.

### fnArgNames.auto(fn: string | Function) => answer
If a string is passed, it returns the result of fnArgNames.strict, otherwise it returns the result of fnArgNames.default .

<div id='contacts'></div>

# Contacts

**Yandex Mail** - vladimirvsevolodovi@yandex.ru

**Github** - https://github.com/StormExecute/

# Platforms

**Github** - https://github.com/StormExecute/fn-arg-names/

**NPM** - https://www.npmjs.com/package/fn-arg-names/

# License

**MIT** - https://mit-license.org/

[npm-url]: https://www.npmjs.com/package/fn-arg-names
[npm-image]: https://img.shields.io/npm/v/fn-arg-names.svg