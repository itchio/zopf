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
  bar: () => Promise.resolve(11),
  baz: () => Promise.reject(22)
}

test('passing promise', t => {
  return foo.bar().then(v => t.is(v, 11))
})

test('failing promise', t => {
  return foo.baz().catch(e => t.is(e, 22))
})

test('sync spy', t => {
  let spy = t.spy()
  spy()
  t.true(spy.calledOnce)
})

test('async spy', t => {
  let spy = t.spy()
  foo.baz().catch(spy).finally(() => {
    t.true(spy.calledWith(22))
  })
})

test('stub', t => {
  let stub = t.stub().throws()
  let caught = false
  foo.bar().then(stub).catch(e => caught = true).finally(() => {
    t.true(caught)
  })
})

test.serial('sync mock', t => {
  let mock = t.mock(foo)
  mock.expects('bar').returns(33)
  t.is(foo.bar(), 33)
})

test.serial('async mock', t => {
  let mock = t.mock(foo)
  mock.expects('bar').returns(Promise.resolve(33))
  foo.bar().then(res => {
    t.is(res, 33)
  })
})
