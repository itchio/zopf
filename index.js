require('source-map-support').install()

var ava = require('ava')
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

    // returning a promise makes AVA run it asynchronously
    return Promise.method(fn)(t).then(() => {
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

        throw lines.slice(0, i).filter(function (x) {
          return !/node_modules.bluebird/.test(x)
        }).join('\n')
      } else {
        throw e
      }
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

  ava(title, wrap(fn))
}

/**
 * To use as a last resort, when mocking global resources -
 * usually a sign of test smell
 */
zopf.serial = function (title, fn) {
  if (typeof title !== 'string') {
    fn = title
    title = null
  }

  ava.serial(title, wrap(fn))
}

module.exports = zopf
