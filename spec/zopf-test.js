import test from '../index.js'
import Promise from 'bluebird'

test('noop test', t => {})

let x = 0
;[1, 2, 3].forEach((y) => {
  test.serial(`serial test ${y}`, t => {
    x += 1
    t.is(x, y)
  })
})

let foo = {
  bar: () => Promise.resolve(11)
}

test('promise test', t => {
  return foo.bar().then(v => t.is(v, 11))
})

