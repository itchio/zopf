require('source-map-support').install()

var tape = require('tape')
var sinon = require('sinon')
var Promise = require('bluebird')

Promise.longStackTraces()

var wrap = function (fn) {
  return function (t) {
    // a sinon sandbox for spies, stubs and mocks
    var sandbox = sinon.sandbox.create({
      injectInto: t,
      properties: ['spy', 'stub', 'mock']
    })

    t.rejects = function (promise) {
      var sentinel = t.spy()
      return promise.catch(sentinel).finally(function () {
        sinon.assert.calledOnce(sentinel)
      })
    }

    Promise.method(fn)(t).then(() => {
      // Only verify sandbox if we didn't get another response
      sandbox.verifyAndRestore()
    }).catch((e) => {
      if (e && e.stack) {
        var lines = e.stack.split('\n')
        var i = 0

        // find first zopf occurence in stack trace
        while (i < lines.length) {
          var line = lines[i]
          if (/node_modules.zopf/.test(line)) {
            i--
            break
          }
          i++
        }

        t.fail(lines.slice(0, i).filter(function (x) {
          return !/node_modules.bluebird/.test(x)
        }).join('\n'))
      } else {
        t.fail(e)
      }
    }).finally(() => {
      t.end()
    })
  }
}

/**
 * Ran concurrently, write tests accordingly!
 */
var zopf = function (title, fn) {
  if (typeof title !== 'string') {
    fn = title
    title = null
  }

  tape(title, wrap(fn))
}

module.exports = zopf
