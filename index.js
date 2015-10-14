require('source-map-support').install()

var tape = require('tape')
var sinon = require('sinon')
var Promise = require('bluebird')

Promise.longStackTraces()

var wrap = function (title, fn) {
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

    t.all = function (args) {
      return Promise.map(args, function (promise) {
        var name = 'anonymous promise'
        if (Array.isArray(promise)) {
          var spec = promise
          promise = spec[0]
          name = spec[1]
        }
        return promise.then(function () {
          t.pass(name)
        })
      }, {concurrency: 1})
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

        var filtered_lines = lines.slice(0, i).filter(function (x) {
          return !/node_modules.bluebird/.test(x)
        })

        var is_stack_frame = function (line) {
          return /^\s*at /.test(line)
        }
        var frame_lines = filtered_lines.filter(is_stack_frame)
        var message_lines = filtered_lines.filter(function (x) { return !is_stack_frame(x) })

        t.fail(message_lines.join(' '))
        frame_lines.forEach(function (line) { console.log(line) })
      } else {
        t.fail(e)
      }
    }).finally(() => {
      if (t.assertCount === 0) {
        t.pass('pass')
      }
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

  tape(title, wrap(title, fn))
}

module.exports = zopf
