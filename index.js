
var tape = require('tape')
var sinon = require('sinon')
var Promise = require('bluebird')

require('sinon-as-promised')(Promise)

var clone = function (x) {
  return JSON.parse(JSON.stringify(x))
}

var zopf

var wrap = function (title, fn, sub) {
  return function (t) {
    var pass_name = sub ? title : 'pass'

    // a sinon sandbox for spies, stubs and mocks
    var sandbox = sinon.sandbox.create({
      injectInto: t,
      properties: ['spy', 'stub', 'mock']
    })

    t.rejects = function (promise) {
      var sentinel = t.spy()
      return Promise.resolve(promise).catch(sentinel).finally(function () {
        sinon.assert.calledOnce(sentinel)
      })
    }

    t.sameSet = function (a, b, message) {
      var x = clone(a).sort()
      var y = clone(b).sort()
      t.same(x, y, message)
    }

    t.samePaths = function (a, b, message) {
      var path = require('path')
      var normalize = function (x) { return path.normalize(x) }
      var x = a.map(normalize)
      var y = b.map(normalize)
      t.sameSet(x, y, message)
    }

    var cases = []

    t.case = function (title, fn) {
      var t2 = {}
      for (var k of Object.keys(t)) {
        switch (k) {
          case 'spy':
          case 'stub':
          case 'mock':
            break
          default:
            t2[k] = t[k]
        }
      }
      var fnw = wrap(title, fn, true)
      cases.push(Promise.method(() => fnw(t2)))
    }

    let startedAt = Date.now()
    let finishedAt

    return Promise.method(fn)(t).then(() => {
      finishedAt = Date.now()

      // Only verify sandbox if we didn't get another response
      sandbox.verify()
    }).then(() => {
      if (cases.length > 0) {
        var val = Promise.resolve()
        for (var i = 0; i < cases.length; i++) {
          val = val.then(cases[i])
        }
        return val
      } else if (t.assertCount === 0) {
        t.pass(pass_name)
      }
    }).catch((e) => {
      t.fail(e)
    }).finally(() => {
      let duration = (finishedAt - startedAt)
      zopf.testDurations.push({title, duration})
      sandbox.restore()
      if (!sub) {
        t.end()
      }
    })
  }
}

zopf = function (title, fn) {
  if (typeof title !== 'string') {
    fn = title
    title = null
  }

  tape(title, wrap(title, fn, false))
}

zopf.module = function (obj) {
  obj.__esModule = true
  obj.default = obj
  if (!obj.hasOwnProperty('@noCallThru')) {
    obj['@noCallThru'] = true
  }
  return obj
}

zopf.testDurations = []

module.exports = zopf
