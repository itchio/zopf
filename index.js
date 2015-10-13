require('source-map-support').install()

var ava = require('ava')
var sinon = require('sinon')
var Promise = require('bluebird')

var wrap = function (fn) {
  return function (t) {
    // a sinon sandbox for spies, stubs and mocks
    var sandbox = sinon.sandbox.create({
      injectInto: t,
      properties: ['spy', 'stub', 'mock']
    })

    // returning a promise makes AVA run it asynchronously
    return new Promise(function (resolve, reject) {
      try {
        resolve(fn(t))
      } catch (e) {
        reject(e.stack)
      }
      resolve()
    }).then(() => {
      // Only verify sandbox if we didn't get another response
      sandbox.verifyAndRestore()
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
