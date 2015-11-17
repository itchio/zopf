# zopf

![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)
[![Build Status](https://travis-ci.org/itchio/zopf.svg)](https://travis-ci.org/itchio/zopf)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)
[![Dependency Status](https://david-dm.org/itchio/zopf.svg)](https://david-dm.org/itchio/zopf)

If you're running a bunch of tests:

  - Transpiled from another languages (ES2015 to ES5 via babel, for example)
    and for which you'd like stack traces in the original language
  - That use [sinon][sinon] to spy, stub and mock things
  - That sometimes return promises
  - That should fail individually when they throw

...and you want to avoid setting all that up yourself for every test case
or file, then zopf just might be for you.

## Usage & examples

zopf is actually a thin wrapper over [tape][], which means you can use it
pretty much the same:

```javascript
var test = require('zopf')

test('basic test', function (t) {
  t.is(true, true)
})
```

You don't need to call `t.end()`.

If you return a Promise, the test will be async and will pass if no assertion
fail and the promise resolves.

If you return something else, the test will end there.

The context, `t`, is augmented with a [sinon][] sandbox that lets you create
spies, stubs and mocks, and verifies all of them at the end of the test.

```javascript
import test from 'zopf'
import Promise from 'bluebird'

let foo = {
  bar: () => Promise.resolve('Uh oh.')
}

test('using promises', t => {
  let mock = t.mock(foo)
  mock.expects('bar').returns(Promise.resolve('Success!'))

  return foo.bar().then(res => {
    t.is(res, 'Success!')
  })
})
```

In that last example:

  * If `foo.bar()` rejects, the test will fail
  * If `foo.bar()` resolves without calling our mock, the test will
    fail when the sinon sandbox is verified
  * If `foo.bar()` resolves, our mock has been called, but the return
    value is wrong, the test will fail

[tape]: https://www.npmjs.com/package/tape
[sinon]: http://sinonjs.org/

## Running tests

Simply use [tape][] to run your zopf tests - as long as you `require('zopf')`
instead of `require('tape')` you'll get all the zopf niceties for free.

The best way is probably to run `npm install --save-dev tape` and add an npm
script to your package.json:

```json
{
  "name": "yourpackage",
  "scripts": {
    "test": "tape spec/*-test.js"
  }
}
```

## Name meaning / pronunciation

[Zopf][] is a type of Swiss bread, which basically means `braid`. It seemed
appropriate for this module as it braids together several test facilities
and was short and available on npm.

[Zopf]: https://en.wikipedia.org/wiki/Zopf

## License

Licensed under MIT License, see `LICENSE` for details.

