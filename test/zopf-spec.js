var test = require('../index.js')
var sinon = require('sinon')
var Promise = require('bluebird')

test('noop test', t => {})

var foo = {
  bar: () => Promise.resolve(11),
  baz: () => Promise.reject(new Error('22'))
}

test('passing promise', t => {
  return foo.bar().then(v => t.is(v, 11))
})

test('failing promise', t => {
  return foo.baz().catch(e => t.is(e.message, '22'))
})

test('sync spy', t => {
  var spy = t.spy()
  spy()
  t.true(spy.calledOnce)
})

test('async spy', t => {
  var spy = t.spy()
  foo.baz().catch(spy).finally(() => {
    t.true(spy.calledWith(sinon.match({message: '22'})))
  })
})

test('stub', t => {
  var stub = t.stub().throws()
  var caught = false
  foo.bar().then(stub).catch(e => caught = true).finally(() => {
    t.true(caught)
  })
})

test('sync mock', t => {
  var mock = t.mock(foo)
  mock.expects('bar').returns(33)
  t.is(foo.bar(), 33)
})

test('async mock', t => {
  var mock = t.mock(foo)
  mock.expects('bar').returns(Promise.resolve(33))
  foo.bar().then(res => {
    t.is(res, 33)
  })
})
